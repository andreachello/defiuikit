import { formatAmountOut, formatAmountOutMin, formatNativeAddress, formatTokenAmount, getFactory, getRouter, getSigner} from './helpers/helpers';
import ERC20 from "../contracts/ERC20/ERC20.json";
import PAIR from "../contracts/Uniswap/UniswapV2/IUniswapV2Pair.json";
import { ethers } from "ethers";
import { ETH_ADDRESS, uniswapContracts,  } from '../data/constants';
import { TokenMetadataResponse } from '../Swap';

export function doesTokenExist(address: string, signer: ethers.Signer) {
    try {
      return new ethers.Contract(address, ERC20.abi, signer)
    } catch (err) {
      return false;
    }
  }

  export async function getDecimals(token: any) {
    const decimals = await token.decimals().then((result: number) => {
        return result;
      }).catch((error: unknown) => {
        console.log('No tokenDecimals function for this token, set to 0');
        return 0;
      });
      return decimals;
  }

 
  export async function swapTokens(
    address1: TokenMetadataResponse,
    address2: TokenMetadataResponse,
    amount: number,
    accountAddress: string | undefined,
    apiType: string,
    slippage: number
  ) {

    const signer = await getSigner() as ethers.Signer
    const router = getRouter(apiType, signer)
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);

    const amountIn = ethers.utils.parseEther(amount.toString());
    
    const tokens = formatNativeAddress(address1.address, address2.address, apiType)

    const amountOut = await router.callStatic.getAmountsOut(
      amountIn,
      tokens
    );

    if (address1.address !== ETH_ADDRESS) {
      const token1 = new ethers.Contract(address1.address, ERC20.abi, signer);
      await token1.approve(router.address, amountIn);
    }

    const amountOutMin = formatAmountOutMin(slippage, amountOut)

    if (address1.address === ETH_ADDRESS) {
      
        // Eth -> Token
        await router.swapExactETHForTokens(
          amountOutMin,
          tokens,
          accountAddress,
          deadline,
          { value: amountIn },
        );

        } else if (address2.address === ETH_ADDRESS) {

        // Token -> Eth
        await router.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            tokens,
            accountAddress,
            deadline
        );

        } else {

        await router.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          tokens,
          accountAddress,
          deadline
        );
    }

  }

  
export async function getAmountOut(
    address1: TokenMetadataResponse,
    address2: TokenMetadataResponse,
    amountIn: number,
    apiType: string
  ) {
    try {
      
      const signer = await getSigner() as ethers.Signer
      
      const router = getRouter(apiType, signer)
      
      const [addressFrom, addressTo] = formatNativeAddress(address1.address, address2.address, apiType)
      const formattedAmount = formatTokenAmount(address1, amountIn)
      
      console.log("Formatted Amount", formattedAmount);
      console.log("Address From", address1.address);
      console.log("Address To", addressTo);

      const valuesOut = await router.getAmountsOut(
        ethers.BigNumber.from(formattedAmount),
        [addressFrom, addressTo]
        );
        
      const amountOut = formatAmountOut(valuesOut, address2)
        
      return Number(amountOut);
    } catch(err) {
        console.log(err);
    }
  }

// -------------------------------------------------------------------
// Reserves
// -------------------------------------------------------------------

  export async function fetchReserves(address1: TokenMetadataResponse, address2: TokenMetadataResponse, pair: any) {
    try {
      const reservesRaw = await pair.getReserves();
      let results = [
        Number(ethers.utils.formatEther(reservesRaw[0])),
        Number(ethers.utils.formatEther(reservesRaw[1])),
      ];
  
      return [
        (await pair.token0()) === address1 ? results[0] : results[1],
        (await pair.token1()) === address2 ? results[1] : results[0],
      ];
    } catch (err) {
      console.log("no reserves yet");
      return [0, 0];
    }
  }

  export async function getReserves(
    address1: TokenMetadataResponse,
    address2: TokenMetadataResponse,
    accountAddress: string
  ) {

    const signer = await getSigner() as ethers.Signer
    const factory =  getFactory(uniswapContracts.factory, signer)

    const pairAddress = await factory.getPair(address1, address2);
    const pair = new ethers.Contract(pairAddress, PAIR.abi, signer)
  
    const reservesRaw = await fetchReserves(address1, address2, pair);
    const liquidityTokens_BN = await pair.balanceOf(accountAddress);
    const liquidityTokens = Number(
      ethers.utils.formatEther(liquidityTokens_BN)
    ).toFixed(2);
  
    return [
      reservesRaw[0].toFixed(2),
      reservesRaw[1].toFixed(2),
      liquidityTokens,
    ];
  }

