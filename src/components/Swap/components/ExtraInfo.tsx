import * as React from 'react';
import cx from 'classnames'

interface IExtraInfoProps {
    gas: string | undefined,
    sources: {
        name: string,
        proportion: string,
        hops: [],
        intermediateToken: string
    }[] | any,
    priceImpact: string | undefined
} 

const ExtraInfo: React.FunctionComponent<IExtraInfoProps> = ({gas, sources, priceImpact}) => {
  return (
    <>
       <>
        {sources && gas && 
                <div className='flex justify-between mt-4 mb-2'>
                <div className='text-xs'>
                    <p className='text-white '>Estimated Gas:</p>
                    <p className=' text-gray-400'>${gas && Number(gas).toFixed(2)}</p>
                </div>
                <div className='text-xs'>
                <p className='text-white'>Source:</p>
                    {sources && sources.map((source: any, i: number)=> (
                        <div key={i}>
                        {source.hops ?
                        source.hops.map((hop: any, j: number) => {
                            <p key={hop} className='text-gray-400'>{hop}</p>
                        }) : 
                        <p key={source.name} className='text-gray-400'>{source.name}</p>
                        }
                        </div>
                    ))}
                </div>
                </div>
        }
       {priceImpact &&
         <div className='flex justify-between mt-4 mb-2'>
            <div className='text-xs'>
            <p className='text-white'>Price Impact</p>
            <p className={cx(Number(priceImpact) < 1 ? "text-green-400" : "text-red-400")}>
                ~ {Number(priceImpact).toFixed(2)}%
            </p>
            </div>
        </div>
       }
       </>
    </>
  ) ;
};

export default ExtraInfo;
