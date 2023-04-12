import React, { useCallback, useEffect, useState } from 'react';
import {RiArrowUpDownLine} from "react-icons/ri"
import { MdSettings } from 'react-icons/md';

import TokenSelection from './components/TokenSelection';
import { RadioButton, RadioGroup } from '../shared/ui/button/Radio';

import SwapError from './components/SwapError';
import ExtraInfo from './components/ExtraInfo';
import SwapButton from './components/SwapButton';

import SwitchButton from './components/SwitchButton';
import ChainDropdown from './components/ChainDropdown';
import cx from "classnames"
import { useDeFiUIKitContext } from '../shared/context/DeFiUIKitContext';
import { getBalance, getPrice, trySwap } from '../shared/utils/componentFunctions';
import { TokenMetadataResponse, Source } from '../shared/types/types';

export const Swap: React.FunctionComponent<ISwapProps> = ({
    tokenA=null,
    tokenB=null,
    apiType="0x", 
    tokenList, 
    primaryTokens, 
    switchIcon, 
    variant="bidirectional"
}) => {

    const {account, chains, currentProvider, fetchSigner} = useDeFiUIKitContext()
    const [chainId, setChainId] = useState()

    const chain = chains.find((c: { id: string; }) => {
        return c.id === chainId
    })

    const [swapState, setSwapState] = useState("buy")

    const [openPopover, setOpenPopover] = useState(false)
    const [slippage, setSlippage] = useState(2.5)

    const fetchNetwork = async() => {
        const {chainId} =  await currentProvider.getNetwork()
        setChainId(chainId)
    }
    
    const [tokenFrom, setTokenFrom] = useState<TokenMetadataResponse | null>(null)
    const [tokenTo, setTokenTo] = useState<TokenMetadataResponse | null>(null)

    useEffect(() => {
        
        if (!tokenFrom && !tokenTo) {
            setTokenFrom(tokenA)
            setTokenTo(tokenB)
            fetchNetwork()
        }
    }, [tokenFrom, tokenTo])


    const [tokenFromPrice, setTokenFromPrice] = useState("")
    const [tokenToPrice, setTokenToPrice] = useState("")
    const [tokenFromBalance, setTokenFromBalance] = useState<number>(0)
    const [tokenToBalance, setTokenToBalance] = useState<number>(0)
    const [amountFrom, setAmountFrom] = useState<number>(Number("x"))
    const [amountTo, setAmountTo] = useState(0)

    const [gas, setGas] = useState("")
    const [error, setError] = useState<any>()
    const [isLoading, setIsLoading] = useState(false);
    const [hasBalance, setHasBalance] = useState<boolean>()
    const [sources, setSources] = useState<Source[]>([])
    const [priceImpact, setPriceImpact] = useState("")
    const [reserves, setReserves] = useState<string[]>([])

    const [txDetails, setTxDetails] = useState({
        to: "",
        data: "",
        value: 0
    })

    const handleSlippageChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        setSlippage(Number(e.target.value))
    }

    const resetExtraInfo = () => {
        setSources([])
        setGas("")
        setPriceImpact("")
        setError("")
    }

    const resetAll = useCallback(() => {
        setSources([])
        setGas("")
        setTokenFrom(null)
        setTokenTo(null)
        setError("")
        setPriceImpact("")
    }, [])

    // ------------------------
    // Selecting Tokens
    // ------------------------

    const onSelectFrom = (token: TokenMetadataResponse, balance: number) => {
        resetExtraInfo()
        setTokenFrom(token)
        if (balance > 0) {
            setHasBalance(true)
            setTokenFromBalance(balance)
        } else {
            setHasBalance(false)
        }
        getPrice(
            tokenFrom,
            tokenTo,
            amountFrom,
            chain,
            apiType,
            setAmountTo,
            setError,
            setGas,
            setSources,
            setPriceImpact,
            currentProvider,
            fetchSigner,
            account.address,
            setReserves                
        )
    }

    const onSelectTo = (token: TokenMetadataResponse, balance: number) => {
        resetExtraInfo()
        setTokenTo(token)
        setTokenToBalance(balance)
        getPrice(
            tokenFrom,
            tokenTo,
            amountFrom,
            chain,
            apiType,
            setAmountTo,
            setError,
            setGas,
            setSources,
            setPriceImpact,
            currentProvider,
            fetchSigner,
            account.address,
            setReserves                
        )
    }

    const onAmountSelect = (value: number) => {
        resetExtraInfo()
        setAmountFrom(value)
    }

    const onBlur = () => {
        getPrice(
            tokenFrom,
            tokenTo,
            amountFrom,
            chain,
            apiType,
            setAmountTo,
            setError,
            setGas,
            setSources,
            setPriceImpact,
            currentProvider,
            fetchSigner,
            account.address,
            setReserves                
        )
    }

    // ----------------------
    // Switching Tokens
    // ----------------------

    const switchTokens = () => {   
        const from = tokenFrom
        const to = tokenTo     
        setTokenFrom(to)
        setTokenTo(from)
        setAmountFrom(0)        
        setAmountTo(0)
        resetExtraInfo()
    };

    const handleSwitch = (action: string) => {
        setSwapState(action)
        if (swapState !== action) {
            switchTokens()
        }
    }


    // ----------------------------
    // Price, Quotes and Swap
    // ----------------------------

    useEffect(() => {
        const debouncePrice = setTimeout(() => {
            getPrice(
                tokenFrom,
                tokenTo,
                amountFrom,
                chain,
                apiType,
                setAmountTo,
                setError,
                setGas,
                setSources,
                setPriceImpact,
                currentProvider,
                fetchSigner,
                account.address,
                setReserves                
            )
        }, 500)

        return () => clearTimeout(debouncePrice)
    }, [amountFrom])

    const handleSwap = () => {
        trySwap(
            canSwap,
            apiType,
            setIsLoading,
            tokenFrom,
            tokenTo,
            account.address,
            amountFrom,
            chain,
            setAmountTo,
            setError,
            setGas,
            setSources,
            fetchSigner,
            setTxDetails,
            slippage
        )
    }

    useEffect(() => {
        const updateTokenBalance = async () => {
          if (tokenFrom) {
            await getBalance(
                tokenFrom, 
                "from",
                chain,
                currentProvider,
                account.address,
                fetchSigner,
                setTokenFromBalance,
                setTokenFromPrice,
                setHasBalance,
                setTokenToBalance,
                setTokenToPrice,
                setError
                )
          } 
        }
      
        if (account.address) {
            updateTokenBalance()
        }
      }, [tokenFromBalance, tokenFrom])

    useEffect(() => {
        const updateTokenBalance = async () => {
          if (tokenTo) {
            await getBalance(
                tokenTo, 
                "to",
                chain,
                currentProvider,
                account.address,
                fetchSigner,
                setTokenFromBalance,
                setTokenFromPrice,
                setHasBalance,
                setTokenToBalance,
                setTokenToPrice,
                setError
                )
          } 
        }
      
        if (account.address) {
            updateTokenBalance()
        }
      }, [tokenToBalance, tokenTo])
      
    const canSwap = !!(hasBalance) && tokenFrom && tokenTo && Number(amountFrom) && amountTo && account && Number(amountFrom) <= tokenFromBalance
    const isFilledOut = tokenFrom && tokenTo && Number(amountFrom) && amountTo && !!account    

  return (
    <div className='relative border border-[#353536] p-4 rounded-xl w-[22rem] shadow self-center'>
        <SwitchButton onSwitch={switchTokens}>
        {
            typeof switchIcon === "object" ? switchIcon
            : switchIcon === "none" || variant === "unidirectional" ? null 
            : 
            <div className='rounded-full border w-fit p-2 cursor-pointer'>
                <RiArrowUpDownLine className='text-white text-xl '/>
            </div>  
        }
        </SwitchButton>

       {variant && variant === "unidirectional" &&
        <div className="flex justify-evenly items-center text-center text-white cursor-pointer mb-4">
        <p 
        className={cx("px-4 w-1/2", swapState === "buy" ? "bg-indigo-500 " : "")} 
        onClick={() => handleSwitch("buy")}>Buy</p>
        <p 
        className={cx("px-4 w-1/2", swapState === "sell" ? "bg-indigo-500 " : "")} 
        onClick={() => handleSwitch("sell")}>Sell</p>
    </div>
       }

        <div className='relative flex justify-between'>
            <ChainDropdown resetAll={resetAll} apiType={apiType} chain={chain}/>
            <MdSettings className='text-gray-500 cursor-pointer mt-3 text-lg' onClick={() => setOpenPopover(prev => !prev)} />
                {openPopover ?
                <div className='absolute right-6 z-50 bg-gray-600 w-[16rem] h-[12rem] p-2 rounded-lg border border-gray-700'>
                <p className='text-white'>Settings</p>
               <div className='mt-3 text-gray-400 mb-2'>Slippage Tolerance</div>
              <RadioGroup onChange={handleSlippageChange}>
                <RadioButton value={0.5} slippage={slippage}>0.5%</RadioButton>
                <RadioButton value={2.5} slippage={slippage}>2.5%</RadioButton>
                <RadioButton value={5} slippage={slippage}>5.0%</RadioButton>
              </RadioGroup>
            </div> : null}
            </div>
    
        <TokenSelection onTokenSelect={onSelectFrom} onAmountSelect={onAmountSelect} onBlur={onBlur} amountFrom={amountFrom} token={tokenFrom} tokenBalance={tokenFromBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenFromPrice} apiType={apiType} chain={chain}/>
        <TokenSelection onTokenSelect={onSelectTo} amountTo={amountTo} onBlur={onBlur} token={tokenTo} disabled={true} tokenBalance={tokenToBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenToPrice} apiType={apiType} chain={chain}/>
        <SwapError error={error}/>
        <ExtraInfo gas={gas} sources={sources} priceImpact={priceImpact} tokenFrom={tokenFrom} tokenTo={tokenTo}/>
        <SwapButton 
                canSwap={canSwap} 
                swapFunction={handleSwap} 
                isLoading={isLoading} 
                isFilledOut={isFilledOut} 
                tokenFromBalance={tokenFromBalance} 
                amountFrom={Number(amountFrom)} 
                tokenSymbol={tokenFrom?.symbol} />
    </div>
  );
};

// export default Swap;

interface ISwapProps {
    tokenA?: TokenMetadataResponse,
    tokenB?: TokenMetadataResponse,
    apiType?: '0x' | '1inch' | 'uniswapv2' | 'pancakeswap',
    tokenList?: TokenMetadataResponse[],
    primaryTokens?: TokenMetadataResponse[],
    switchIcon?: "none" | React.ReactNode, // default?
    variant?: "bidirectional" | "unidirectional"
}
