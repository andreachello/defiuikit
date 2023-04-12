import axios from "axios"
import { ethers, Signer } from "ethers";
import { BASE_PATH_0X, BASE_PATH_1INCH, BASE_PATH_PORTALS, ETH_ADDRESS, NATIVE_TOKEN_ADDRESS } from "../data/constants";
import ERC20ABI from "../contracts/ERC20/ERC20.abi.json"
import { baseCurrencies } from "../data/tokens";
import { Source, SwapPriceResponse, TokenMetadataResponse } from "../types/types";
import { getAmountOut, getReserves, swapTokens } from "./ethereumFunctions";

export const getTokenPrice = async(
    token: any, 
    chain: any,
    error: (err:any) => void
    ) => {

    if (!token) return

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
    } catch (err) {
        error(err)
    }
}

export const getBalance = async(
    token: any,
    tokenType: string,
    chain: any,
    provider: any,
    accountAddress: string,
    fetchSigner: any,
    setTokenFromBalance: (n: number) => void,
    setTokenFromPrice: (s: string) => void,
    setHasBalance: (b: boolean) => void,
    setTokenToBalance: (n: number) => void,
    setTokenToPrice: (s: string) => void,
    setError: (e: any) => void,
    ) => {

    let balance;
    
    if (accountAddress && token.name) {

        try {
            
        if (token?.symbol === chain?.nativeCurrency.symbol) {
            balance = await provider.getBalance(accountAddress)   
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

            balance = await ERC20TokenContract.balanceOf(accountAddress)
        }

        const result = Number(Number(balance).toFixed(7))

        if (tokenType === "from") {
            setTokenFromBalance(result)
            const priceFrom = await getTokenPrice(token, chain, setError)
            setTokenFromPrice(priceFrom)

            if (result > 0) {
                setHasBalance(true)
            } else {
                setHasBalance(false)
            }
        } else if (tokenType === "to"){
            setTokenToBalance(result)
            const priceTo = await getTokenPrice(token, chain, setError)
            setTokenToPrice(priceTo)
        }
        return result
        } catch (error: any) {
            setError(error.reason)
        }
    } 
}

export const getPrice = async (
    tokenFrom: TokenMetadataResponse | null,
    tokenTo: TokenMetadataResponse | null,
    amountFrom: number,
    chain: any,
    apiType: string,
    setAmountTo: (n: number) => void,
    setError: (e: any) => void,
    setGas: (s: string) => void,
    setSources: (a: any[] | ((prev: any[]) => any[])) => void,
    setPriceImpact: (s: string) => void,
    provider: any,
    fetchSigner: any,
    accountAddress: string,
    setReserves: (sArray: string[]) => void
) => {
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
            
            const ETHPrice = await getTokenPrice(baseCurrencies[0], chain, setError)
            setGas(String(Number(ethers.utils.formatEther(g)) * Number(ETHPrice)));
            
            setError(null)
            setSources([])
            

            setPriceImpact(swapPrice.estimatedPriceImpact)

            swapPrice.sources.map((source: Source) => {
                
                if (Number(source.proportion) > 0) {
                    setSources((prev: any) => [...prev, source])
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

            const tokenOneAddress = getTokenTicker(tokenFrom, chain)
            const tokenTwoAddress = getTokenTicker(tokenTo, chain)
            const response = await axios.get(`${BASE_PATH_1INCH}/quote?fromTokenAddress=${tokenOneAddress}&toTokenAddress=${tokenTwoAddress}&amount=${BigInt(amount).toString()}`)
            const quoteData = response.data 
            
            setSources(quoteData.protocols[0][0]);
            const ETHPrice = await getTokenPrice(baseCurrencies[0], chain, setError)
            const gasPriceRaw = await provider.getGasPrice()
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
            .then((amount: any) => setAmountTo(Number(amount)))
            .catch((error: any) => setError(error))
        
            getReserves(tokenFrom, tokenTo, accountAddress, signer, apiType)
            .then((data: any[]) => {
                setReserves([data[0], data[1]])
                // price_impact = delta_x / (x + delta_x)
                setPriceImpact((amountFrom / (Number(data[0]) + amountFrom) * 100).toFixed(4));
            })
            .catch((err: any) => console.log(err))
    }
}

const getTokenTicker = (
    token: TokenMetadataResponse,
    chain: any
    ) => {
    let tokenTicker;
    if (token.symbol.toUpperCase() === chain?.nativeCurrency.symbol.toUpperCase()) {
        tokenTicker = NATIVE_TOKEN_ADDRESS
    }  else {
        tokenTicker = token.address.toString()
    }
    return tokenTicker
}

const getQuote = async (
    tokenFrom: TokenMetadataResponse,
    tokenTo: TokenMetadataResponse,
    accountAddress: string,
    amountFrom: number,
    chain: any,
    setAmountTo: (n: number) => void,
    setError: (e: any) => void,
    setGas: (s: string) => void,
    setSources: (a: any[] | ((prev: any[]) => any[])) => void
) => {
    if (!tokenFrom || !tokenTo || !accountAddress) return
    let amount = Number(amountFrom) * 10  ** tokenFrom.decimals

    let params;

    // CHECK: not just for ETH
    if (tokenFrom.address !== ETH_ADDRESS) {
        params = {
            sellToken: getTokenTicker(tokenFrom, chain),
            buyToken: getTokenTicker(tokenTo, chain),
            sellAmount: amount.toString(),
            takerAddress: accountAddress.toString()
        }
    } else {
        params = {
            sellToken: getTokenTicker(tokenFrom, chain),
            buyToken: getTokenTicker(tokenTo, chain),
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
        const ETHPrice = await getTokenPrice(baseCurrencies[0], chain, setError)
        setGas(String(Number(ethers.utils.formatEther(g.toString())) * Number(ETHPrice)));
        
        setError(null)
        setSources([])

        quotePrice.sources.map((source: Source) => {
            
            if (Number(source.proportion) > 0) {
                setSources((prev: any) => [...prev, source])
            }
        })
        return quotePrice

    } catch (error) {
        setError(error)
    }
}

const sendTx = async(
    accountAddress: string,
    txData: {
        to: string, 
        data: string, 
        value: number
    }, 
    fetchSigner: any
    ) => {
    
    const {to, data, value} = txData
    const signer = await fetchSigner()
    const txObject = {
        from: accountAddress,
        to,
        data,
        value: BigInt(value)
    }
    
    await signer.sendTransaction(txObject)
    
}

export const trySwap = async(
    canSwap: boolean,
    apiType: string,
    setIsLoading: (b: boolean) => void,
    tokenFrom: TokenMetadataResponse | null,
    tokenTo: TokenMetadataResponse | null,
    accountAddress: string,
    amountFrom: number,
    chain: any,
    setAmountTo: (n: number) => void,
    setError: (e: any) => void,
    setGas: (s: string) => void,
    setSources: (a: any[] | ((prev: any[]) => any[])) => void,
    fetchSigner: any,
    setTxDetails: (o: {
        to: string;
        data: string;
        value: number;
    }) => void,
    slippage: number
) => {

   if (!canSwap || !tokenFrom || !tokenTo) return
   
    if (apiType === "0x") {
        try {
            setIsLoading(true)
            const response = await getQuote(
                tokenFrom,
                tokenTo,
                accountAddress,
                amountFrom,
                chain,
                setAmountTo,
                setError,
                setGas,
                setSources,
            )
        
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
                console.log({to:response.to, data:response.data, value: Number(response.value)});
                
                setTxDetails({to:response.to, data:response.data, value: Number(response.value)})
                sendTx(accountAddress, {to: response.to, data: response.data, value: Number(response.value)}, fetchSigner).catch(err => setError(err))
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
        const allowance = await axios.get(`${BASE_PATH_1INCH}/approve/allowance?tokenAddress=${tokenOneAddress}&walletAddress=${accountAddress}`)
        if (allowance.data.allowance === "0") {
            const approve = await axios.get(`${BASE_PATH_1INCH}/approve/transaction?tokenAddress=${tokenOneAddress}`)
            setTxDetails(approve.data)
        }

        const transaction = await axios(
            `${BASE_PATH_1INCH}/swap?fromTokenAddress=${tokenOneAddress}&toTokenAddress=${tokenTwoAddress}&amount=${convertedAmount}&fromAddress=${accountAddress}&slippage=${slippage}`
        )
        let decimals = Number(`1E${tokenTo.decimals}`)
        setAmountTo(Number((Number(transaction.data.toTokenAmount)/decimals).toFixed(2)))
        setTxDetails(transaction.data.tx)
        sendTx(accountAddress, transaction.data.tx, fetchSigner).catch(err => setError(err))
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
            accountAddress,
            apiType,
            slippage,
            signer
            )
            .then(() => setIsLoading(false))
            .catch((error: any) =>{ 
                setIsLoading(false)
                console.log(error);
            setError(error)
        })
    }
        
}

