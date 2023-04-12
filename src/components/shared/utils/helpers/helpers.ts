import { WETH_ADDRESS, WBNB_ADDRESS } from '../../../shared/data/constants';
import axios from 'axios';
import { ethers } from "ethers"
import { ETH_ADDRESS, uniswapContracts, pancakeswapContracts, nativeTokensList } from "../../../shared/data/constants"
import ROUTER from "../../contracts/Uniswap/UniswapV2/UniswapV2Router02.json";
import ERC20 from "../../contracts/ERC20/ERC20.json";
import FACTORY from "../../contracts/Uniswap/UniswapV2/IUniswapV2Factory.json";
import PAIR from "../../contracts/Uniswap/UniswapV2/IUniswapV2Pair.json";
import PANCAKEROUTER from "../../contracts/Pancakeswap/PancakeRouter01.json";
import PANCAKEFACTORY from "../../contracts/Pancakeswap/Interfaces/IPancakeFactory.json";
import PANCAKEPAIR from "../../contracts/Uniswap/UniswapV2/IUniswapV2Pair.json";
import { TokenMetadataResponse } from '../../types/types';

export const getWrappedToken = async(token: TokenMetadataResponse) => {
  
  if (token.chainId === 1 && token.address === ETH_ADDRESS) {
    const weth = await getTokenMetadata(WETH_ADDRESS)
    return weth
  } else if (token.chainId === 56 && token.address === ETH_ADDRESS) {
    const wbnb = await getTokenMetadata(WBNB_ADDRESS)
    return wbnb
  }
}

export const getTokenMetadata = async(address: string) => {
  // get name from 
  const query = "https://tokens.coingecko.com/uniswap/all.json"
  const response = await axios.get(query)
  const tokenList = response.data.tokens

  if (address) {
    const token =  tokenList.find((token: TokenMetadataResponse) => {
      return token.address === address.toLowerCase()
    })
    return token
  }

}

export const formatNativeAddress = (address1: string, address2: string, apiType: string) => {
    // Wrap the ETH to make it compatible with UniswapV2
    let addressFrom = ""
    let addressTo = ""
    if (address1 === ETH_ADDRESS) {
      addressFrom = apiType === "uniswapv2" ? uniswapContracts.weth : apiType === "pancakeswap" ? pancakeswapContracts.weth : ""
      addressTo = address2
    } else if (address2 === ETH_ADDRESS) {
      addressTo = apiType === "uniswapv2" ? uniswapContracts.weth : apiType === "pancakeswap" ? pancakeswapContracts.weth : ""
      addressFrom = address1
    } else {
      addressFrom = address1
      addressTo = address2
    }
  
    return [addressFrom, addressTo]
  }

export const formatTokenAmount = (address1: any, amountIn: number) => {
    let formattedAmount;
    if (nativeTokensList.includes(address1.address)) {
        formattedAmount = ethers.utils.parseEther(amountIn.toString())
    } else {
        formattedAmount = amountIn * 10 ** address1.decimals
    }
    return formattedAmount
  }

  export const getRouter = (apiType: string, signer:ethers.Signer) => {
      const routerContract = apiType === "uniswapv2" ? uniswapContracts.router : apiType === "pancakeswap" ? pancakeswapContracts.router : ""
      const routerABI = apiType === "uniswapv2" ? ROUTER.abi : apiType === "pancakeswap" ? PANCAKEROUTER : ""
    return new ethers.Contract(routerContract, routerABI, signer)
  }


  export function getFactory(apiType: string, signer: ethers.Signer) {
    const factoryContract = apiType === "uniswapv2" ? uniswapContracts.factory : apiType === "pancakeswap" ? pancakeswapContracts.factory : ""
    const factoryABI = apiType === "uniswapv2" ? FACTORY.abi : apiType === "pancakeswap" ? PANCAKEFACTORY : ""
    return new ethers.Contract(factoryContract, factoryABI, signer)
}

export function getWeth(address: string, signer: ethers.Signer) {
    return new ethers.Contract(address, ERC20.abi, signer)
}

export const formatAmountOutMin = (slippage: number, amountOut: number[]) => {
    /**
    * This parameter specifies the minimum amount of output tokens 
    * that you are willing to receive in exchange for your input tokens. 
    * If the trade results in less output than this amount, it will fail and revert.
    */
   const formattedSlippage = slippage / 100
   return ethers.BigNumber.from(amountOut[1]).mul(ethers.BigNumber.from(10000).sub(formattedSlippage)).div(ethers.BigNumber.from(10000));
   
}

export const formatAmountOut = (valuesOut: number[], address2: TokenMetadataResponse) => {
    let amountOut;
    if (address2.address === uniswapContracts.weth || address2.address === pancakeswapContracts.weth) {
      amountOut = ethers.utils.formatEther(valuesOut[1])
    } else {
      amountOut = Number(valuesOut[1]) / (10 ** address2.decimals)
    }

    return amountOut
}


