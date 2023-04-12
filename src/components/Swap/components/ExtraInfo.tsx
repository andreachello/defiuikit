import * as React from 'react';
import cx from 'classnames'
import { getTokenMetadata, getWrappedToken } from '../../shared/utils/helpers/helpers';
import {Accordion} from '../../shared/ui/accordion';
import { useEffect } from 'react';
import Routes from './Routes';
import { TokenMetadataResponse } from '../../shared/types/types';

interface IExtraInfoProps {
    tokenFrom: TokenMetadataResponse | null,
    tokenTo: TokenMetadataResponse | null,
    gas: string | undefined,
    sources: {
        name: string,
        proportion: string,
        hops: [],
        intermediateToken: string
    }[] | any,
    priceImpact: string | undefined
} 

const ExtraInfo: React.FunctionComponent<IExtraInfoProps> = ({gas, sources, priceImpact, tokenFrom, tokenTo}) => {

    const [intermediateToken, setIntermediateToken] = React.useState()
    const [wrappedToken, setWrappedToken] = React.useState<TokenMetadataResponse | null>()
    const [wrappedDirection, setWrappedDirection] = React.useState("")

    const extraInfoDirection = "vertical"

    useEffect(() => {
       if (tokenFrom) {
        getWrappedToken(tokenFrom).then((token) => {
            if (token) {
                setWrappedToken(token)
                setWrappedDirection("from")
            }
        })
       }
       if (tokenTo) {
        getWrappedToken(tokenTo).then((token) => {
            setWrappedToken(token)
            setWrappedDirection("to")
        })
       }
    }, [tokenFrom])

    if (sources[0]) {
        getTokenMetadata(sources[0].intermediateToken).then(
            data => {
                if (data) {
                    setIntermediateToken(data.logoURI)
                }
            }
        )
    }
    
  return (
    <>
       <>
        {gas && sources && 
                <div className={cx('mt-4 mb-2', extraInfoDirection === 'vertical' ? 'flex-col' : 'flex justify-between')}> 
               
                <div className={cx('text-xs', extraInfoDirection === 'vertical' ? "flex justify-between mb-3": '')}>
                    <p className='text-white '>Estimated Gas:</p>
                    <p className=' text-gray-400'>${gas && Number(gas).toFixed(2)}</p>
                </div>

                <div className={cx('text-xs', extraInfoDirection === 'vertical' ? "flex justify-between": '')}>
                <p className='text-white'>Source:</p>
                <Accordion 
                    title={sources.length > 1 ? "MultiSource" : sources[0].name}
                    content={
                        <Routes 
                            intermediateToken={intermediateToken} 
                            wrappedToken={wrappedToken} 
                            tokenFrom={tokenFrom}
                            tokenTo={tokenTo} 
                            wrappedDirection={wrappedDirection} 
                            sources={sources} 
                            />} 
                    />
                </div>
                
                </div>
        }
       {priceImpact &&
         <div className={cx('mt-4 mb-2', extraInfoDirection === 'vertical' ? 'flex-col' : 'flex justify-between')}>
            <div className={cx('text-xs', extraInfoDirection === 'vertical' ? "flex justify-between mb-3": '')}>
            <p className='text-white'>Price Impact</p>
            <p className={cx(Number(priceImpact) < 5 ? "text-green-400" : "text-red-400")}>
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
