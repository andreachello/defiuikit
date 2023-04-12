// import React, { useCallback, useEffect, useState } from 'react';
// import axios from "axios"
// import {RiArrowUpDownLine} from "react-icons/ri"
// import { MdSettings } from 'react-icons/md';

// import TokenSelection from '../Swap/components/TokenSelection';
// import { RadioButton, RadioGroup } from '../shared/ui/button/Radio';

// import { ethers, Signer } from 'ethers';
// import SwapError from '../Swap/components/SwapError';
// import ExtraInfo from '../Swap/components/ExtraInfo';
// import SwapButton from '../Swap/components/SwapButton';
// import SwitchButton from '../Swap/components/SwitchButton';
// import ChainDropdown from '../Swap/components/ChainDropdown';

// import { quoteAddLiquidity } from '../shared/utils/liquidityFunctions';
// import { BASE_PATH_PORTALS } from '../shared/data/constants';
// import LiquidityInfo from './components/LiquidityInfo';

// import { useDeFiUIKitContext } from '../shared/context/DeFiUIKitContext';

// const LiquidityPool: React.FunctionComponent<ISwapProps> = ({
//     tokenA=null,
//     tokenB=null,
//     apiType="0x", 
//     tokenList, 
//     primaryTokens, 
//     switchIcon
// }) => {

//     const {account, chains, currentProvider, fetchSigner} = useDeFiUIKitContext()
//     const [chainId, setChainId] = useState()

//     const chain = chains.find((c: { id: string; }) => {
//         return c.id === chainId
//     })

//     const [swapState, setSwapState] = useState("buy")

//     const [openPopover, setOpenPopover] = useState(false)
//     const [slippage, setSlippage] = useState(2.5)

//     const fetchNetwork = async() => {
//         const {chainId} =  await currentProvider.getNetwork()
//         setChainId(chainId)
//     }
    
//     const [tokenFrom, setTokenFrom] = useState<TokenMetadataResponse | null>(null)
//     const [tokenTo, setTokenTo] = useState<TokenMetadataResponse | null>(null)

//     useEffect(() => {
        
//         if (!tokenFrom && !tokenTo) {
//             setTokenFrom(tokenA)
//             setTokenTo(tokenB)
//             fetchNetwork()
//         }
//     }, [tokenFrom, tokenTo])

//     const [tokenFromPrice, setTokenFromPrice] = useState("")
//     const [tokenToPrice, setTokenToPrice] = useState("")
//     const [tokenFromBalance, setTokenFromBalance] = useState<number>(0)
//     const [tokenToBalance, setTokenToBalance] = useState<number>(0)
//     const [amountFrom, setAmountFrom] = useState<number>()
//     const [amountTo, setAmountTo] = useState(0)

//     const [liquidityOut, setLiquidityOut] = useState([0, 0, 0]);

//     const [error, setError] = useState<any>()
//     const [isLoading, setIsLoading] = useState(false);
//     const [hasBalance, setHasBalance] = useState<boolean>()
//     const [txDetails, setTxDetails] = useState({
//         to: "",
//         data: "",
//         value: 0
//     })
    
//     const {ETHPrice, gasPrice} = useEthereumContext()

//     const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSlippage(Number(e.target.value))
//     }

//     const resetExtraInfo = () => {

//     }

//     const resetAll = useCallback(() => {
//         setTokenFrom(null)
//         setTokenTo(null)
//         setError("")
//     }, [])

//     // ------------------------
//     // Selecting Tokens
//     // ------------------------

//     const onSelectFrom = (token: TokenMetadataResponse, balance: number) => {
//         resetExtraInfo()
//         setTokenFrom(token)
//         if (balance > 0) {
//             setHasBalance(true)
//             setTokenFromBalance(balance)
//         } else {
//             setHasBalance(false)
//         }
//     }

//     const onSelectTo = (token: TokenMetadataResponse, balance: number) => {
//         resetExtraInfo()
//         setTokenTo(token)
//         setTokenToBalance(balance)
//         // getPrice()
//     }


//     const onAmountFromSelect = (value: number) => {
//         resetExtraInfo()
//         setAmountFrom(value)
//     }
//     const onAmountToSelect = (value: number) => {
//         resetExtraInfo()
//         setAmountTo(value)
        
//     }


//     // ----------------------------
//     // Price, Quotes and Swap
//     // ----------------------------

//     useEffect(() => {
//         const debouncePrice = setTimeout(() => {
//             getLiquidityQuote()
//         }, 500)

//         return () => clearTimeout(debouncePrice)
//     }, [amountFrom])

//     const getLiquidityQuote = async () => {
//         if (!tokenFrom || !tokenTo || (tokenFrom.address === tokenTo.address) || amountFrom == 0 || amountTo == 0 ) return

//         quoteAddLiquidity(
//             tokenFrom.address,
//             tokenTo.address,
//             amountFrom,
//             amountTo,
//             apiType
//             ).then((data: number[]) => {
//                 setLiquidityOut([data[0], data[1], data[2]]);
//                 // setAmountTo(data[1])
//             })
//     }
  


//     const trySwap = async() => {

//        if (!canSwap) return
       
//        try {
        
  
            
//         } catch (error) {
//             setError(error)
//             setIsLoading(false)
//         }
//     }

  


//     const getBalance = async(token: any, tokenType: string) => {

//         let balance;
        
//         if (account.address) {

//             if (token?.symbol === chain?.nativeCurrency.symbol) {
//                 balance = await fetchBalance({
//                     address: account.address as `0x${string}`,
//                     })    
//                     balance = balance.formatted        
//             } else {
//                 balance = await fetchBalance({
//                     address: account.address as `0x${string}`,
//                     token: token?.address,
//                     })
//                 balance = balance.formatted   
//             }

//             const result = Number(Number(balance).toFixed(6))
    
//             if (tokenType === "from") {
//                 setTokenFromBalance(result)
//                 const priceFrom = await getTokenPrice(token)
//                 setTokenFromPrice(priceFrom)
//             } else if (tokenType === "to"){
//                 setTokenToBalance(result)
//                 const priceTo = await getTokenPrice(token)
//                 setTokenToPrice(priceTo)
//             }
//             return result
//         } 
//     }
    

//     useEffect(() => {
//         const updateTokenBalance = async () => {
//           if (tokenFrom) {
//             await getBalance(tokenFrom, "from")
//           } 
//         }
      
//         updateTokenBalance()
//       }, [tokenFromBalance, tokenFrom])

//     useEffect(() => {
//         const updateTokenBalance = async () => {
//           if (tokenTo) {
//             await getBalance(tokenTo, "to")
//           } 
//         }
      
//         updateTokenBalance()
//       }, [tokenToBalance, tokenTo])

//     const canSwap = !!(hasBalance) && tokenFrom && tokenTo && Number(amountFrom) && amountTo && account && Number(amountFrom) <= tokenFromBalance
//     const isFilledOut = tokenFrom && tokenTo && Number(amountFrom) && amountTo && !!account

//   return (
//     <div className='relative border border-[#353536] p-4 rounded-xl w-[22rem] shadow self-center'>
//         {/* <SwitchButton onSwitch={""}>
//         {
//             typeof switchIcon === "object" ? switchIcon
//             : switchIcon === "none" ? null 
//             : 
//             <div className='rounded-full border w-fit p-2 cursor-pointer'>
//                 <RiArrowUpDownLine className='text-white text-xl '/>
//             </div>  
//         }
//         </SwitchButton> */}
//         <div className='relative flex justify-between'>
//             {/* <ChainDropdown resetAll={resetAll} apiType={apiType}/> */}
//             <MdSettings className='text-gray-500 cursor-pointer mt-3 text-lg' onClick={() => setOpenPopover(prev => !prev)} />
//                 {openPopover ?
//                 <div className='absolute right-6 z-50 bg-gray-600 w-[16rem] h-[12rem] p-2 rounded-lg border border-gray-700'>
//                 <p className='text-white'>Settings</p>
//                <div className='mt-3 text-gray-400 mb-2'>Slippage Tolerance</div>
//               <RadioGroup onChange={handleSlippageChange}>
//                 <RadioButton value={0.5}>0.5%</RadioButton>
//                 <RadioButton checked={true} value={2.5}>2.5%</RadioButton>
//                 <RadioButton value={5}>5.0%</RadioButton>
//               </RadioGroup>
//             </div> : null}
//             </div>
    
//         <TokenSelection onTokenSelect={onSelectFrom} onAmountSelect={onAmountFromSelect} getPrice={getLiquidityQuote} token={tokenFrom} tokenBalance={tokenFromBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenFromPrice} apiType={apiType}/>
//         <TokenSelection onTokenSelect={onSelectTo} onAmountSelect={onAmountToSelect} getPrice={getLiquidityQuote} token={tokenTo} tokenBalance={tokenToBalance} tokenList={tokenList} primaryTokens={primaryTokens} tokenPrice={tokenToPrice} apiType={apiType}/>
//         <SwapError error={error}/>
//         <LiquidityInfo 
//             liquidityOut={liquidityOut}
//         />
//         <SwapButton 
//                 canSwap={canSwap} 
//                 swapFunction={trySwap} 
//                 isLoading={isLoading} 
//                 isFilledOut={isFilledOut} 
//                 tokenFromBalance={tokenFromBalance} 
//                 amountFrom={Number(amountFrom)} 
//                 tokenSymbol={tokenFrom?.symbol} />
//     </div>
//   );
// };

// export default LiquidityPool;

// interface ISwapProps {
//     tokenA?: TokenMetadataResponse,
//     tokenB?: TokenMetadataResponse,
//     apiType?: 'uniswapv2' | 'pancakeswap', // pool type
//     tokenList: TokenMetadataResponse[] | undefined,
//     primaryTokens: TokenMetadataResponse[],
//     switchIcon?: "none" | React.ReactNode
// }

// interface Source {
//     name: string,
//     proportion: string,
//     hops: [],
//     intermediateToken: string
// }

// interface SwapPriceResponse {
//     chainId: number,
//     price: string,
//     estimatedPriceImpact: string,
//     value: string,
//     gasPrice: string,
//     gas: string,
//     estimatedGas: string,
//     protocolFee:string,
//     minimumProtocolFee: string,
//     buyTokenAddress: string,
//     buyAmount: string,
//     sellTokenAddress: string,
//     sellAmount: string,
//     sources: [],
//     allowanceTarget: string,
//     sellTokenToEthRate: string,
//     buyTokenToEthRate: string,
//     expectedSlippage: number,
//     to?: string,
//     data?:string
// }

// interface Source1Inch { 
//     name: string,
//     part: number,
//     fromTokenAddress: string,
//     toTokenAddress: string,
// }


// interface QuoteResponse1Inch {
//     fromToken: {
//       symbol: string,
//       name: string,
//       address: string,
//       decimals: 0,
//       logoURI: string
//     },
//     toToken: {
//       symbol: string,
//       name: string,
//       address: string,
//       decimals: 0,
//       logoURI:string
//     },
//     toTokenAmount: string,
//     fromTokenAmount: string,
//     protocols: [
//       [
//         [
//             {
//                 name: string,
//                 part: number,
//                 fromTokenAddress: string,
//                 toTokenAddress: string
//               }
//         ]
//       ]
//     ],
//     estimatedGas: 0
//   }

//   export interface TokenMetadataResponse {
//     chainId: number,
//     address: string,
//     name: string,
//     symbol: string,
//     decimals: number,
//     logoURI: string
// }