import * as React from 'react';

interface ILiquidityInfoProps {
    liquidityOut: number[],
    reserves: any
} 

const LiquidityInfo: React.FunctionComponent<ILiquidityInfoProps> = ({liquidityOut, reserves}) => {
  return (
    <>
       {reserves &&
       
        <div className='flex justify-between mt-4 mb-2'>
        <div className='text-xs'>
            <p className='text-white '>Reserves A:</p>
            <p className=' text-gray-400'>{Number(reserves[0]).toLocaleString()}</p>
            <p className='text-white '>Reserves B:</p>
            <p className=' text-gray-400'>{Number(reserves[1]).toLocaleString()}</p>
            <p className='text-white '>Token A:</p>
            <p className=' text-gray-400'>${liquidityOut[0]}</p>
            <p className='text-white '>Token B:</p>
            <p className=' text-gray-400'>${liquidityOut[1]}</p>
            <p className='text-white '>Amount Out:</p>
            <p className=' text-gray-400'>${liquidityOut[2]}</p>
        </div>
        <div className='text-xs'>
       
        </div>
        </div>
       }
    </>
  ) ;
};

export default LiquidityInfo;
