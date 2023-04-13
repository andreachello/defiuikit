import React, { useCallback, useEffect, useState } from 'react';
import {RiArrowUpDownLine} from "react-icons/ri"
import { MdSettings } from 'react-icons/md';

import TokenSelection from '../Swap/components/TokenSelection';
import { RadioButton, RadioGroup } from '../shared/ui/button/Radio';

import SwapError from '../Swap/components/SwapError';
import SwapButton from '../Swap/components/SwapButton';
import SwitchButton from '../Swap/components/SwitchButton';
import ChainDropdown from '../Swap/components/ChainDropdown';

import { quoteAddLiquidity } from '../shared/utils/liquidityFunctions';
import LiquidityInfo from './components/LiquidityInfo';

import { useDeFiUIKitContext } from '../shared/context/DeFiUIKitContext';
import { getBalance, getTokenPrice } from '../shared/utils/componentFunctions';
import { TokenMetadataResponse } from '../shared/types/types';
import { fetchReserves, getReserves } from '../shared/utils/ethereumFunctions';

export const LiquidityPool: React.FunctionComponent<ISwapProps> = ({
    tokenA=null,
    tokenB=null,
    apiType="uniswapv2", 
    tokenList, 
    primaryTokens, 
    switchIcon
}) => {

    const {account, chains, currentProvider, fetchSigner} = useDeFiUIKitContext()
    const [chainId, setChainId] = useState()

    const chain = chains.find((c: { id: string; }) => {
        return c.id === chainId
    })

    const [swapState, setSwapState] = useState("buy")
    const [reserves, setReserves] = useState<string[]>([])

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
    const [amountFrom, setAmountFrom] = useState<number>()
    const [amountTo, setAmountTo] = useState(0)

    const [liquidityOut, setLiquidityOut] = useState([0, 0, 0]);

    const [error, setError] = useState<any>()
    const [isLoading, setIsLoading] = useState(false);
    const [hasBalance, setHasBalance] = useState<boolean>()
    const [txDetails, setTxDetails] = useState({
        to: "",
        data: "",
        value: 0
    })
    
    const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlippage(Number(e.target.value))
    }

    const resetExtraInfo = () => {

    }

    const resetAll = useCallback(() => {
        setTokenFrom(null)
        setTokenTo(null)
        setError("")
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
    }

    const onSelectTo = (token: TokenMetadataResponse, balance: number) => {
        resetExtraInfo()
        setTokenTo(token)
        setTokenToBalance(balance)
        // getPrice()
    }


    const onAmountFromSelect = (value: number) => {
        resetExtraInfo()
        setAmountFrom(value)
    }
    const onAmountToSelect = (value: number) => {
        resetExtraInfo()
        setAmountTo(value)
        
    }


    // ----------------------------
    // Price, Quotes and Swap
    // ----------------------------

    useEffect(() => {
        const debouncePrice = setTimeout(() => {
            getLiquidityQuote()
        }, 500)

        return () => clearTimeout(debouncePrice)
    }, [amountFrom])

    const getLiquidityQuote = async () => {
        if (!tokenFrom || !tokenTo || (tokenFrom.address === tokenTo.address) || amountFrom == 0 || amountTo == 0 ) return

        if (apiType !== "pancakeswap" && apiType !== "uniswapv2") return 

        const signer = await fetchSigner()

        console.log(account.address);
        
        getReserves(tokenFrom, tokenTo, signer, apiType).then(
            (data) => setReserves(data)
        )

        quoteAddLiquidity(
            tokenFrom,
            tokenTo,
            amountFrom,
            amountTo,
            apiType,
            signer
            ).then((data: number[]) => {
                setLiquidityOut([data[0], data[1], data[2]]);
                // setAmountTo(data[1])
            })
    }
  


    const trySwap = async() => {

       if (!canSwap) return
       
       try {
        
  
            
        } catch (error) {
            setError(error)
            setIsLoading(false)
        }
    }
    

    // useEffect(() => {
    //     const updateTokenBalance = async () => {
    //       if (tokenFrom) {
    //         await getBalance(
    //             tokenFrom, 
    //             "from",
    //             chain,
    //             currentProvider,
    //             account.address,
    //             fetchSigner,
    //             setTokenFromBalance,
    //             setTokenFromPrice,
    //             setHasBalance,
    //             setTokenToBalance,
    //             setTokenToPrice,
    //             setError
    //             )
    //       } 
    //     }
      
    //     if (account.address) {
    //         updateTokenBalance()
    //     }
    //   }, [tokenFromBalance, tokenFrom])

    // useEffect(() => {
    //     const updateTokenBalance = async () => {
    //       if (tokenTo) {
    //         await getBalance(
    //             tokenTo, 
    //             "to",
    //             chain,
    //             currentProvider,
    //             account.address,
    //             fetchSigner,
    //             setTokenFromBalance,
    //             setTokenFromPrice,
    //             setHasBalance,
    //             setTokenToBalance,
    //             setTokenToPrice,
    //             setError
    //             )
    //       } 
    //     }
      
    //     if (account.address) {
    //         updateTokenBalance()
    //     }
    //   }, [tokenToBalance, tokenTo])
      

    const canSwap = !!(hasBalance) && tokenFrom && tokenTo && Number(amountFrom) && amountTo && account && Number(amountFrom) <= tokenFromBalance
    const isFilledOut = tokenFrom && tokenTo && Number(amountFrom) && amountTo && !!account

  return (
    <div className='relative border border-[#353536] p-4 rounded-xl w-[22rem] shadow self-center'>
        {/* <SwitchButton onSwitch={""}>
        {
            typeof switchIcon === "object" ? switchIcon
            : switchIcon === "none" ? null 
            : 
            <div className='rounded-full border w-fit p-2 cursor-pointer'>
                <RiArrowUpDownLine className='text-white text-xl '/>
            </div>  
        }
        </SwitchButton> */}
        <div className='relative flex justify-between'>
            {/* <ChainDropdown resetAll={resetAll} apiType={apiType}/> */}
            <MdSettings className='text-gray-500 cursor-pointer mt-3 text-lg' onClick={() => setOpenPopover(prev => !prev)} />
                {openPopover ?
                <div className='absolute right-6 z-50 bg-gray-600 w-[16rem] h-[12rem] p-2 rounded-lg border border-gray-700'>
                <p className='text-white'>Settings</p>
               <div className='mt-3 text-gray-400 mb-2'>Slippage Tolerance</div>
              {/* <RadioGroup onChange={handleSlippageChange}>
                <RadioButton value={0.5}>0.5%</RadioButton>
                <RadioButton checked={true} value={2.5}>2.5%</RadioButton>
                <RadioButton value={5}>5.0%</RadioButton>
              </RadioGroup> */}
            </div> : null}
            </div>
    
        <TokenSelection onTokenSelect={onSelectFrom} onAmountSelect={onAmountFromSelect} onBlur={getLiquidityQuote} token={tokenFrom} tokenBalance={tokenFromBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenFromPrice} apiType={apiType} chain={chain}/>
        <TokenSelection onTokenSelect={onSelectTo} onAmountSelect={onAmountToSelect} onBlur={getLiquidityQuote} token={tokenTo} tokenBalance={tokenToBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenToPrice} apiType={apiType} chain={chain}/>
        <SwapError error={error}/>
        <LiquidityInfo 
            liquidityOut={liquidityOut}
            reserves={reserves}
            tokenFrom={tokenFrom}
            tokenTo={tokenTo}
            amountFrom={amountFrom}
        />
        <SwapButton 
                canSwap={canSwap} 
                swapFunction={trySwap} 
                isLoading={isLoading} 
                isFilledOut={isFilledOut} 
                tokenFromBalance={tokenFromBalance} 
                amountFrom={Number(amountFrom)} 
                tokenSymbol={tokenFrom?.symbol} />
    </div>
  );
};

// export default LiquidityPool;

interface ISwapProps {
    tokenA?: TokenMetadataResponse,
    tokenB?: TokenMetadataResponse,
    apiType?: 'uniswapv2' | 'pancakeswap', // pool type
    tokenList: TokenMetadataResponse[] | undefined,
    primaryTokens: TokenMetadataResponse[],
    switchIcon?: "none" | React.ReactNode
}
