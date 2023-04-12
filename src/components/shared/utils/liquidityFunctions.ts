// import { getFactory } from './helpers/helpers';

// import { getContract, fetchSigner } from '@wagmi/core'

// import ERC20 from "../contracts/ERC20/ERC20.json";
// import PAIR from "../contracts/Uniswap/UniswapV2/IUniswapV2Pair.json";
// import { ethers } from "ethers";
// import { fetchReserves, getDecimals } from './ethereumFunctions';
  

// // ---------------------------------
// // Liquidity Functions
// // ---------------------------------

// const quote = (amount1, reserve1, reserve2) => {
//     const amount2 = amount1 * (reserve2 / reserve1);
//     return [amount2];
//   };
  
//   const Getliquidity = (liquidity_tokens) => {
//     if (liquidity_tokens < 0.001){
//       return ethers.BigNumber.from(liquidity_tokens*10**18);
//     }
//     return ethers.utils.parseUnits(String(liquidity_tokens), 18);
//   }
  
  
//   // ---------------------
//   // 1. Add Liquidity
//   // ---------------------
  
//   /**
//    * Modified implementation of mint in UniswapV2Pair.sol
//    * 
//    * - not minting LP tokens but just showing a quote of how many LP tokens 
//    *   will be minted
//    */
  
//   const quoteMintLiquidity = async(
//     tokenA: any,
//     tokenB: any,
//     amountA: any,
//     amountB: any,
//     factory: any,
//     signer: any
//   ) => {
    
//     const MINIMUM_LIQUIDITY = 1000
  
//     // if there is a pair retrieve the values, if not "create it", i.e. setting values to zero
//     const [_reserveA, _reserveB, totalSupply] = await factory.getPair(tokenA, tokenB)
//     .then(async (pairAddress) => {
  
//       // if pair exists retrieve value
//       if (pairAddress != '0x0000000000000000000000000000000000000000') {
//         const pair = getContract({address: pairAddress, abi: PAIR.abi, signerOrProvider:signer})
//         const reserves = await fetchReserves(tokenA, tokenB, pair, signer)
//         const reserveA = reserves[0]
//         const reserveB = reserves[1]
  
//         const _totalSupply = await pair.totalSupply()
//         const totalSupply = Number(ethers.utils.formatEther(_totalSupply))
  
//         return [reserveA, reserveB, totalSupply]
//       } else {
//         // return a new pair
//         return [0,0,0]
//       }
//     })
  
//     const token1 = getContract({address: tokenA, abi: ERC20.abi, signerOrProvider: signer})
//     const token2 = getContract({address: tokenB, abi: ERC20.abi, signerOrProvider: signer})
  
//     const token1Decimals = await getDecimals(token1);
//     const token2Decimals = await getDecimals(token2);
  
//     const valueA = amountA*(10**token1Decimals);
//     const valueB = amountB*(10**token2Decimals);
  
//     const reserveA = _reserveA*(10**token1Decimals);
//     const reserveB = _reserveB*(10**token2Decimals);
  
//     if (totalSupply == 0){
//       return Math.sqrt(((valueA * valueB)-MINIMUM_LIQUIDITY))*10**(-18);
//     };
    
//     return (
//       Math.min(valueA*totalSupply/reserveA, valueB*totalSupply/reserveB)
//     );
//   }
  
//   /**
//    * Modified implementation of _addLiquidity in UniswapV2Router02.sol
//    *
//    */
  
//   export const quoteAddLiquidity = async(
//     address1: any,
//     address2: any,
//     amountADesired: any,
//     amountBDesired: any,
//     apiType: string
//   ) => {
//     const signer = await fetchSigner()
//     const factory =  getFactory(apiType, signer)
//     const pairAddress = await factory.getPair(address1, address2);
//     const pair = getContract({address: pairAddress, abi: PAIR.abi, signerOrProvider: signer});
  
//     const reservesRaw = await fetchReserves(address1, address2, pair, signer);
//     const reserveA = reservesRaw[0];
//     const reserveB = reservesRaw[1];
  
//     console.log("Reserves: ", reservesRaw);
    
  
//     // warn if reserves are both zero like in pancakeswap -- you are the first to deploy liquidity
//     if (reserveA === 0 && reserveB === 0) {
//       const amountOut = await quoteMintLiquidity(
//         address1,
//         address2,
//         amountADesired,
//         amountBDesired,
//         factory,
//         signer);
//       return [
//         amountADesired,
//         amountBDesired,
//         amountOut.toPrecision(8),
//       ];
//     } else {
//       const amountBOptimal = quote(amountADesired, reserveA, reserveB);
//       if (amountBOptimal <= amountBDesired) {
//         const amountOut = await quoteMintLiquidity(
//           address1,
//           address2,
//           amountADesired,
//           amountBOptimal,
//           factory,
//           signer);
//         return [
//           amountADesired,
//           amountBOptimal,
//           amountOut.toPrecision(8),
//         ];
//       } else {
//         const amountAOptimal = quote(
//           amountBDesired,
//           reserveB,
//           reserveA
//         );
//         const amountOut = await quoteMintLiquidity(
//           address1,
//           address2,
//           amountAOptimal,
//           amountBDesired,
//           factory,
//           signer);
//         return [
//           amountAOptimal,
//           amountBDesired,
//           amountOut.toPrecision(8),
//         ];
//       }
//     }
//   }
  
  
//   export const quoteAddLiquidityHalf = async(
//     address1: any,
//     address2: any,
//     apiType: string,
//     amountADesired?: any,
//     amountBDesired?: any,
//   ) => {
//     const signer = await fetchSigner()
//     const factory =  getFactory(apiType, signer)
//     const pairAddress = await factory.getPair(address1, address2);
//     const pair = getContract({address: pairAddress, abi: PAIR.abi, signerOrProvider: signer});
  
//     const reservesRaw = await fetchReserves(address1, address2, pair, signer);
//     const reserveA = reservesRaw[0];
//     const reserveB = reservesRaw[1];
  
//     if (amountADesired) {
//       const amountBOptimal = quote(amountADesired, reserveA, reserveB);
//       if (amountBOptimal <= amountBDesired) {
//         const amountOut = await quoteMintLiquidity(
//           address1,
//           address2,
//           amountADesired,
//           amountBOptimal,
//           factory,
//           signer);
//         return [
//           amountADesired,
//           amountBOptimal,
//           amountOut.toPrecision(8),
//         ];
//       } else if (amountBDesired) {
//         const amountAOptimal = quote(
//           amountBDesired,
//           reserveB,
//           reserveA
//         );
//         const amountOut = await quoteMintLiquidity(
//           address1,
//           address2,
//           amountAOptimal,
//           amountBDesired,
//           factory,
//           signer);
//         return [
//           amountAOptimal,
//           amountBDesired,
//           amountOut.toPrecision(8),
//         ];
//       }
//     }
//   }
  
//   /**
//    * Call addLiquidity or addLiquidityETH in UniswapV2Router02.sol
//    */
  
//    export async function addLiquidity(
//     address1: any,
//     address2: any,
//     amount1: any,
//     amount2: any,
//     amount1min: any,
//     amount2min: any,
//     routerContract: any,
//     account: any,
//     signer: any
//   ) {
//     const token1 = getContract({address: address1, abi: ERC20.abi, signerOrProvider: signer});
//     const token2 = getContract({address: address2, abi: ERC20.abi, signerOrProvider: signer});
  
//     const token1Decimals = await getDecimals(token1);
//     const token2Decimals = await getDecimals(token2);
  
//     const amountIn1 = ethers.utils.parseUnits(amount1, token1Decimals);
//     const amountIn2 = ethers.utils.parseUnits(amount2, token2Decimals);
  
//     const amount1Min = ethers.utils.parseUnits(amount1min, token1Decimals);
//     const amount2Min = ethers.utils.parseUnits(amount2min, token2Decimals);
  
//     const time = Math.floor(Date.now() / 1000) + 200000;
//     const deadline = ethers.BigNumber.from(time);
  
//     await token1.approve(routerContract.address, amountIn1);
//     await token2.approve(routerContract.address, amountIn2);
  
//     const wethAddress = await routerContract.WETH();
  
//     console.log([
//       address1,
//       address2,
//       amountIn1,
//       amountIn2,
//       amount1Min,
//       amount2Min,
//       account,
//       deadline,
//     ]);
  
//     if (address1 === wethAddress) {
//       // Eth + Token
//       await routerContract.addLiquidityETH(
//         address2,
//         amountIn2,
//         amount2Min,
//         amount1Min,
//         account,
//         deadline,
//         { value: amountIn1 }
//       );
//     } else if (address2 === wethAddress) {
//       // Token + Eth
//       await routerContract.addLiquidityETH(
//         address1,
//         amountIn1,
//         amount1Min,
//         amount2Min,
//         account,
//         deadline,
//         { value: amountIn2 }
//       );
//     } else {
//       // Token + Token
//       await routerContract.addLiquidity(
//         address1,
//         address2,
//         amountIn1,
//         amountIn2,
//         amount1Min,
//         amount2Min,
//         account,
//         deadline
//       );
//     }
//   }
  
//   // ---------------------
//   // 2. Remove Liquidity
//   // ---------------------
  
//   /**
//    * Modified implementation of the burn function in UniswapV2Pair.sol
//    */
  
//   export async function quoteBurnLiquidity(
//     address1,
//     address2,
//     liquidity,
//     factory,
//     signer
//   ) {
//     const pairAddress = await factory.getPair(address1, address2);
//     const pair = getContract({address: pairAddress, abi: PAIR.abi, signerOrProvider: signer});
  
//     const reservesRaw = await fetchReserves(address1, address2, pair, signer); // Returns the reserves already formated as ethers
//     const reserveA = reservesRaw[0];
//     const reserveB = reservesRaw[1];
  
//     const feeOn =
//       (await factory.feeTo()) !== 0x0000000000000000000000000000000000000000;
  
//     const _kLast = await pair.kLast();
//     const kLast = Number(ethers.utils.formatEther(_kLast));
  
//     const _totalSupply = await pair.totalSupply();
//     let totalSupply = Number(ethers.utils.formatEther(_totalSupply));
  
//     if (feeOn && kLast > 0) {
//       const feeLiquidity =
//         (totalSupply * (Math.sqrt(reserveA * reserveB) - Math.sqrt(kLast))) /
//         (5 * Math.sqrt(reserveA * reserveB) + Math.sqrt(kLast));
//       totalSupply = totalSupply + feeLiquidity;
//     }
  
//     const Aout = (reserveA * liquidity) / totalSupply;
//     const Bout = (reserveB * liquidity) / totalSupply;
  
//     return [liquidity, Aout, Bout];
//   }
  
  
//   export async function removeLiquidity(
//     address1,
//     address2,
//     liquidity_tokens,
//     amount1min,
//     amount2min,
//     routerContract,
//     account,
//     signer,
//     factory
//   ) {
//     const token1 = getContract({address: address1, abi: ERC20.abi, signerOrProvider: signer});
//     const token2 =  getContract({address: address2, abi: ERC20.abi, signerOrProvider: signer});
  
//     const token1Decimals = await getDecimals(token1);
//     const token2Decimals = await getDecimals(token2);
  
//     const liquidity = Getliquidity(liquidity_tokens);
  
//     const amount1Min = ethers.utils.parseUnits(String(amount1min), token1Decimals);
//     const amount2Min = ethers.utils.parseUnits(String(amount2min), token2Decimals);
  
//     const time = Math.floor(Date.now() / 1000) + 200000;
//     const deadline = ethers.BigNumber.from(time);
  
//     const wethAddress = await routerContract.WETH();
//     const pairAddress = await factory.getPair(address1, address2);
//     const pair = getContract({address: pairAddress, abi: PAIR.abi, signerOrProvider: signer})
  
//     await pair.approve(routerContract.address, liquidity);
  
//     console.log([
//       address1,
//       address2,
//       Number(liquidity),
//       Number(amount1Min),
//       Number(amount2Min),
//       account,
//       deadline,
//     ]);
  
//     if (address1 === wethAddress) {
//       // Eth + Token
//       await routerContract.removeLiquidityETH(
//         address2,
//         liquidity,
//         amount2Min,
//         amount1Min,
//         account,
//         deadline
//       );
//     } else if (address2 === wethAddress) {
//       // Token + Eth
//       await routerContract.removeLiquidityETH(
//         address1,
//         liquidity,
//         amount1Min,
//         amount2Min,
//         account,
//         deadline
//       );
//     } else {
//       // Token + Token
//       await routerContract.removeLiquidity(
//         address1,
//         address2,
//         liquidity,
//         amount1Min,
//         amount2Min,
//         account,
//         deadline
//       );
//     }
//   }