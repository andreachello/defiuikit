import React, { useCallback, useEffect, useState } from 'react';
import axios from "axios"
import {RiArrowUpDownLine} from "react-icons/ri"
import ERC20ABI from "./contracts/ERC20/ERC20.abi.json"
import { MdSettings } from 'react-icons/md';

import TokenSelection from './components/TokenSelection';
import { RadioButton, RadioGroup } from './components/ui/button/Radio';

import { ethers, Signer } from 'ethers';
import SwapError from './components/SwapError';
import ExtraInfo from './components/ExtraInfo';
import SwapButton from './components/SwapButton';

import SwitchButton from './components/SwitchButton';
import ChainDropdown from './components/ChainDropdown';
import { getAmountOut, getReserves, swapTokens } from './utils/ethereumFunctions';
import { BASE_PATH_0X, BASE_PATH_1INCH, NATIVE_TOKEN_ADDRESS, BASE_PATH_PORTALS, ETH_ADDRESS } from './data/constants';
import cx from "classnames"
import { useDeFiUIKitContext } from './context/DeFiUIKitContext';
import { baseCurrencies } from './data/tokens';

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
        getPrice()
    }

    const onSelectTo = (token: TokenMetadataResponse, balance: number) => {
        resetExtraInfo()
        setTokenTo(token)
        setTokenToBalance(balance)
        getPrice()
    }

    const onAmountSelect = (value: number) => {
        resetExtraInfo()
        setAmountFrom(value)
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
            getPrice()
        }, 500)

        return () => clearTimeout(debouncePrice)
    }, [amountFrom])

    const getPrice = async () => {
        if (!tokenFrom || !tokenTo || (tokenFrom.address === tokenTo.address) || amountFrom === 0 || !amountFrom) return
        let amount = Number(Number(amountFrom) * 10  ** tokenFrom.decimals)

        const params = {
            sellToken: tokenFrom.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase() ? tokenFrom.symbol : tokenFrom.address,
            buyToken: tokenTo.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase() ? tokenTo.symbol : tokenTo.address,
            sellAmount: BigInt(amount).toString(),
        }

        const searchParams = new URLSearchParams(params).toString()

        // fetch swap price
        if (apiType === "0x") {
                try {

                const response = await axios.get(`${BASE_PATH_0X}/price?${searchParams}`)
                const swapPrice = await response.data as SwapPriceResponse
                console.log(swapPrice);
                
                setAmountTo(Number(swapPrice.buyAmount) / (10 ** tokenTo.decimals))

                // TODO: take care of bigdecimal
                const g = BigInt(Number(swapPrice.estimatedGas) * Number(swapPrice.gasPrice));
                
                const ETHPrice = await getTokenPrice(baseCurrencies[0])
                setGas(String(Number(ethers.utils.formatEther(g)) * Number(ETHPrice)));
                
                setError(null)
                setSources([])
                

                setPriceImpact(swapPrice.estimatedPriceImpact)
    
                swapPrice.sources.map((source: Source) => {
                    
                    if (Number(source.proportion) > 0) {
                        setSources((prev) => [...prev, source])
                    }
                })     
                

                } catch (error:any) {
                    if (error.response) {
                        setError(error.response.data.validationErrors[0].reason)
                    } else {
                        setError(error)
                    }
                }
            } else if (apiType === "1inch") {
                try {

                const tokenOneAddress = getTokenTicker(tokenFrom)
                const tokenTwoAddress = getTokenTicker(tokenTo)
                const response = await axios.get(`${BASE_PATH_1INCH}/quote?fromTokenAddress=${tokenOneAddress}&toTokenAddress=${tokenTwoAddress}&amount=${BigInt(amount).toString()}`)
                const quoteData = response.data 
                
                setSources(quoteData.protocols[0][0]);
                const ETHPrice = await getTokenPrice(baseCurrencies[0])
                const gasPriceRaw = await currentProvider.getGasPrice()
                const gasPrice = ethers.utils.formatUnits(gasPriceRaw, "ether")
                setGas(String(quoteData.estimatedGas * Number(gasPrice) * ETHPrice))
                setError("")
                const convertedToAmount = (Number(quoteData.toTokenAmount) / (10 ** tokenTo.decimals)).toFixed(8)
                setAmountTo(Number(convertedToAmount));
                } catch (error:any) {
                setError(error.response.data.description)
            }
        } else if (apiType === "uniswapv2" || apiType === "pancakeswap") {

            const signer = await fetchSigner()

              // TODO FIX FOR BSC
            getAmountOut(tokenFrom, tokenTo, amountFrom, apiType, signer)
                .then((amount) => setAmountTo(Number(amount)))
                .catch((error) => setError(error))
            
                getReserves(tokenFrom, tokenTo, account.address, signer, apiType)
                .then((data) => {
                    setReserves([data[0], data[1]])
                    // price_impact = delta_x / (x + delta_x)
                    setPriceImpact((amountFrom / (Number(data[0]) + amountFrom) * 100).toFixed(4));
                })
                .catch(err => console.log(err))
        }
    }

    const getTokenTicker = (token: TokenMetadataResponse) => {
        let tokenTicker;
        if (token.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase()) {
            tokenTicker = NATIVE_TOKEN_ADDRESS
        }  else {
            tokenTicker = token.address.toString()
        }
        return tokenTicker
    }

    const getQuote = async () => {
        if (!tokenFrom || !tokenTo || !account.address) return
        let amount = Number(amountFrom) * 10  ** tokenFrom.decimals

        let params;

        // CHECK: not just for ETH
        if (tokenFrom.address !== ETH_ADDRESS) {
            params = {
                sellToken: getTokenTicker(tokenFrom),
                buyToken: getTokenTicker(tokenTo),
                sellAmount: amount.toString(),
                takerAddress: account.address.toString()
            }
        } else {
            params = {
                sellToken: getTokenTicker(tokenFrom),
                buyToken: getTokenTicker(tokenTo),
                sellAmount: amount.toString(),
            }
        }

        const searchParams = new URLSearchParams(params).toString()

        // fetch swap quote
        try {
            const response = await axios.get(`${BASE_PATH_0X}/quote?${searchParams}`)
            const quotePrice = await response.data as SwapPriceResponse
            setAmountTo(Number(quotePrice.buyAmount) / (10 ** tokenTo.decimals))
            const g = (Number(quotePrice.estimatedGas) * Number(quotePrice.gasPrice));
            const ETHPrice = await getTokenPrice(baseCurrencies[0])
            setGas(String(Number(ethers.utils.formatEther(g.toString())) * Number(ETHPrice)));
            
            setError(null)
            setSources([])

            quotePrice.sources.map((source: Source) => {
                
                if (Number(source.proportion) > 0) {
                    setSources((prev) => [...prev, source])
                }
            })
            return quotePrice

        } catch (error) {
            resetExtraInfo()
            setError(error)
        }
    }

    const trySwap = async() => {

       if (!canSwap) return
       
        if (apiType === "0x") {
            try {
                setIsLoading(true)
                const response = await getQuote()
            
                // // Set Token Allowance
                const signer = await fetchSigner() as Signer
                const ERC20TokenContract = new ethers.Contract(tokenFrom.address, ERC20ABI, signer)
                
                const maxApproval = 2**(256-1)

                // CHECK needs to work with any chain
                if (tokenFrom.address !== ETH_ADDRESS) {
                    await ERC20TokenContract.approve(
                        response?.allowanceTarget,
                        maxApproval
                    )
                }
        
                // send transaction
                if (signer && response?.to && response.data && response.value) {
                    setTxDetails({to:response.to, data:response.data, value: Number(response.value)})
                    sendTx({to:response.to, data:response.data, value: Number(response.value)}).catch(err => setError(err))
                    setIsLoading(false)
                }
            } catch (error) {
                setError(error)
                setIsLoading(false)
            }
        } else if (apiType === "1inch") {
            
           try {
            const convertedAmount = Number(amountFrom) * (10 ** tokenFrom.decimals)
            const tokenOneAddress = tokenFrom.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase() ? NATIVE_TOKEN_ADDRESS : tokenFrom.address // native tokens for the API
            const tokenTwoAddress = tokenTo.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase() ? NATIVE_TOKEN_ADDRESS : tokenTo.address

            setIsLoading(true)
            const allowance = await axios.get(`${BASE_PATH_1INCH}/approve/allowance?tokenAddress=${tokenOneAddress}&walletAddress=${account.address}`)
            if (allowance.data.allowance === "0") {
                const approve = await axios.get(`${BASE_PATH_1INCH}/approve/transaction?tokenAddress=${tokenOneAddress}`)
                setTxDetails(approve.data)
            }

            const transaction = await axios(
                `${BASE_PATH_1INCH}/swap?fromTokenAddress=${tokenOneAddress}&toTokenAddress=${tokenTwoAddress}&amount=${convertedAmount}&fromAddress=${account.address}&slippage=${slippage}`
            )
            let decimals = Number(`1E${tokenTo.decimals}`)
            setAmountTo(Number((Number(transaction.data.toTokenAmount)/decimals).toFixed(2)))
            setTxDetails(transaction.data.tx)
            sendTx(transaction.data.tx).catch(err => setError(err))
            setIsLoading(false)
 
           } catch (error: any) {
                setError(error.response.data.description)
                setIsLoading(false)
           }

        } else if (apiType === "uniswapv2" || apiType === "pancakeswap") {
            const signer = await fetchSigner()

            setError("")
            setIsLoading(true)
            swapTokens(
                tokenFrom,
                tokenTo,
                amountFrom,
                account.address,
                apiType,
                slippage,
                signer
                )
                .then(() => setIsLoading(false))
                .catch((error) =>{ 
                    setIsLoading(false)
                    console.log(error);
                setError(error)
            })
        }
            
    }

    const sendTx = async({to, data, value}: {to: string, data: string, value: number}) => {
        const signer = await fetchSigner()
        const txObject = {
            from: account.address,
            to,
            data,
            value,
        }
        console.log(txObject);
        
        const tx = await signer.sendTransaction(txObject)
    }
  
    const getTokenPrice = async(token: any) => {

        if (!token || !account.address) return

        let network;
        let tokenType;
        let supportedNetworks = [ "ethereum", "optimism", "fantom", "arbitrum one", "polygon", "avalanche", "bnb smart chain"]
        
        if (chain && supportedNetworks.includes(chain?.name.toLowerCase())) {
            if (chain?.name.toLowerCase() === "arbitrum one") {
                network = "arbitrum"
            } else if (chain?.name === "BNB Smart Chain") {
                network = "bsc"
            } else {
                network = chain?.name.toLowerCase()
            }
        }
    
        if (token?.symbol === chain?.nativeCurrency.symbol) {
            tokenType = "native"
        } else {
            tokenType = "basic"
        }

        if (!network || !token.address) return
        
        let query = `${BASE_PATH_PORTALS}/tokens?addresses=${network}%3A${token?.address}&platforms=${tokenType}&networks=${network}&sortDirection=asc&limit=25&page=0`
        
        try {
            const resp = await axios.get(query) 
            return resp.data.tokens[0].price
        } catch (error) {
            console.log(error);
            setError(error)
        }
    }

    const getBalance = async(token: any, tokenType: string) => {

        let balance;
        
        if (account.address && token.name) {

            try {
                
            if (token?.symbol === chain?.nativeCurrency.symbol) {
                balance = await currentProvider.getBalance(account.address)   
                balance = ethers.utils.formatEther(balance) 

            } else {
                let signer;
                while (!signer) {
                    signer = await fetchSigner() as Signer;
                    if (!signer) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before trying again
                    }
                }
                
                const ERC20TokenContract = new ethers.Contract(token.address, ERC20ABI, signer)

                balance = await ERC20TokenContract.balanceOf(account.address)
            }

            const result = Number(Number(balance).toFixed(7))
    
            if (tokenType === "from") {
                setTokenFromBalance(result)
                const priceFrom = await getTokenPrice(token)
                setTokenFromPrice(priceFrom)

                if (result > 0) {
                    setHasBalance(true)
                } else {
                    setHasBalance(false)
                }
            } else if (tokenType === "to"){
                setTokenToBalance(result)
                const priceTo = await getTokenPrice(token)
                setTokenToPrice(priceTo)
            }
            return result
            } catch (error: any) {
                setError(error.reason)
            }
        } 
    }
    

    useEffect(() => {
        const updateTokenBalance = async () => {
          if (tokenFrom) {
            await getBalance(tokenFrom, "from")
          } 
        }
      
        if (account.address) {
            updateTokenBalance()
        }
      }, [tokenFromBalance, tokenFrom])

    useEffect(() => {
        const updateTokenBalance = async () => {
          if (tokenTo) {
            await getBalance(tokenTo, "to")
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
    
        <TokenSelection onTokenSelect={onSelectFrom} onAmountSelect={onAmountSelect} getPrice={getPrice} amountFrom={amountFrom} token={tokenFrom} tokenBalance={tokenFromBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenFromPrice} apiType={apiType} chain={chain}/>
        <TokenSelection onTokenSelect={onSelectTo} amountTo={amountTo} getPrice={getPrice} token={tokenTo} disabled={true} tokenBalance={tokenToBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenToPrice} apiType={apiType} chain={chain}/>
        <SwapError error={error}/>
        <ExtraInfo gas={gas} sources={sources} priceImpact={priceImpact} tokenFrom={tokenFrom} tokenTo={tokenTo}/>
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

interface Source {
    name: string,
    proportion: string,
    hops: [],
    intermediateToken: string
}


interface SwapPriceResponse {
    chainId: number,
    price: string,
    estimatedPriceImpact: string,
    value: string,
    gasPrice: string,
    gas: string,
    estimatedGas: string,
    protocolFee:string,
    minimumProtocolFee: string,
    buyTokenAddress: string,
    buyAmount: string,
    sellTokenAddress: string,
    sellAmount: string,
    sources: [],
    allowanceTarget: string,
    sellTokenToEthRate: string,
    buyTokenToEthRate: string,
    expectedSlippage: number,
    to?: string,
    data?:string
}

  export interface TokenMetadataResponse {
    chainId: number,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURI: string,
    image?: string,
}