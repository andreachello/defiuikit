import * as React from 'react';
import { TokenMetadataResponse } from '../../shared/types/types';

interface ILiquidityInfoProps {
    liquidityOut: number[],
    reserves: any,
    tokenFrom: TokenMetadataResponse | null,
    tokenTo: TokenMetadataResponse | null,
    amountFrom: number | undefined
} 

const LiquidityInfo: React.FunctionComponent<ILiquidityInfoProps> = ({liquidityOut, reserves, tokenFrom, tokenTo, amountFrom}) => {
  return (
    <>
       {reserves && tokenFrom && tokenTo && amountFrom &&
       
        <div className='flex flex-col justify-between mt-4 mb-2 space-y-4'>
            
            <div>
              <p className='text-white text-sm mb-3'>Reserves</p>
              <div className='flex space-x-4 justify-between text-xs'>
                <p className=' text-gray-400'>{Number(reserves[0]).toLocaleString()} {tokenFrom.symbol}</p>
                <p className=' text-gray-400'>{Number(reserves[1]).toLocaleString()} {tokenTo.symbol}</p>
              </div>
            </div>
            <div>
              <p className='text-white text-sm mb-3'>Prices</p>
              <div className='flex space-x-4 justify-between text-xs'>
                <p className=' text-gray-400'>
                  {
                  Number(liquidityOut[1]/liquidityOut[0]) > 0.01 ?
                  Number(liquidityOut[1]/liquidityOut[0]).toFixed(2)
                : Number(liquidityOut[1]/liquidityOut[0]).toFixed(10)
                } {tokenFrom.symbol} per {tokenTo.symbol}
                </p>
                <p className=' text-gray-400'>
                {
                  Number(liquidityOut[0]/liquidityOut[1]) > 0.01 ?
                  Number(liquidityOut[0]/liquidityOut[1]).toFixed(2)
                : Number(liquidityOut[0]/liquidityOut[1]).toFixed(10)
                } {tokenTo.symbol} per {tokenFrom.symbol}
                </p>
              </div>
            </div>
            <div className='flex justify-between'>
              <div className='text-xs'>
                <p className='text-white text-sm mb-3'>LP Tokens:</p>
                  <p className=' text-gray-400'>{liquidityOut[2]}</p>
              </div>
              <div className='text-xs'>
                  <p className='text-white text-sm mb-3'>Share of Pool</p>
                  <p className=' text-gray-400'>{((amountFrom / reserves[0])*100).toFixed(2)} %</p>
              </div>
            </div>
        
       
        <div className='text-xs'>
       
        </div>
        </div>
       }
    </>
  ) ;
};

export default LiquidityInfo;
