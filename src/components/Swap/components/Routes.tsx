import * as React from 'react';
import { TokenMetadataResponse } from '../Swap';

interface IRoutesProps {
    intermediateToken: string | undefined,
    wrappedToken: TokenMetadataResponse | null | undefined,
    tokenFrom: TokenMetadataResponse | null,
    tokenTo: TokenMetadataResponse | null,
    wrappedDirection: string,
    sources: {
        name: string,
        proportion: string,
        hops: [],
        intermediateToken: string
    }[] | any,
}

const Routes: React.FunctionComponent<IRoutesProps> = ({intermediateToken, wrappedToken, tokenFrom, tokenTo, wrappedDirection, sources}) => {
    console.log(sources);
    
  return (
    <>
        {!intermediateToken ?
    <>
    <div className='flex mt-6' style={wrappedToken ? {marginLeft: "-14.5rem"} : {marginLeft: "-2.5rem"}}>

    <img src={tokenFrom?.logoURI} />

    {wrappedToken ? 
    <>
    <svg width="100%" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
    <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
    </line>
    </svg>

    <div className="flex mt-1" style={{marginRight: "1rem", marginLeft: "0.2rem"}}>
    {wrappedDirection === "from" ?
    <>
        <img style={{height: "24px", width: "24px"}} className="border-2 border-white rounded-full dark:border-gray-800" src={wrappedToken?.logoURI} alt="" />
        <img className="border-2 border-white rounded-full dark:border-gray-800" style={{marginLeft: "-0.5rem", marginBottom: "0.3rem", height: "26px", width: "64px"}} src={tokenTo?.logoURI} alt="" />
    </>
    :
    <>
        <img className="border-2 border-white rounded-full dark:border-gray-800" style={{marginBottom: "0.3rem", height: "26px", width: "64px"}} src={tokenFrom?.logoURI} alt="" />
        <img style={{height: "24px", width: "24px", marginLeft: "-0.5rem"}} className="border-2 border-white rounded-full dark:border-gray-800" src={wrappedToken?.logoURI} alt="" />
    </>}

    </div>

    <svg width="100%" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
        <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
        </line>
    </svg>    
    </>
    : 
    <svg width="300" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
        <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
        </line>
    </svg>    
    }

    <img src={tokenTo?.logoURI}/>
    </div>

    <div className='flex flex-col' style={wrappedToken ? {marginLeft: "-14.5rem"} : {marginLeft: "-2.5rem"}}>
    {sources && sources.map((source: any, i: number)=> (

    source.name !== "MultiHop" &&
        <p key={source.name + i} className='text-gray-400'>{source.name}{source.proportion ? " - " + (source.proportion * 100).toFixed(1) + "%" : ""}</p>
    
    ))}
    </div>
    </>
    :
    <>
    {sources && sources.map((source: any, i: number)=> (
            <div key={i}>
            {source.name === "MultiHop" ?
        <>
            {source.hops.map((hop: any, j: number) => (
                <>
                <div key={hop + j} className='flex mt-6' style={wrappedToken ? {marginLeft: "-14.5rem"} : {marginLeft: "-2.5rem"}}>

                <img src={j === 0 ? tokenFrom?.logoURI : intermediateToken} />
                {wrappedToken && j === 0 ? 
                <>
                <svg width="100%" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
                <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
                </line>
                </svg>

                <div className="flex mt-1" style={{marginRight: "1rem", marginLeft: "0.2rem"}}>
                {wrappedDirection === "from" ?
                <>
                    <img style={{height: "24px", width: "24px"}} className="border-2 border-white rounded-full dark:border-gray-800" src={wrappedToken?.logoURI} alt="" />
                    <img className="border-2 border-white rounded-full dark:border-gray-800" style={{marginLeft: "-0.5rem", marginBottom: "0.3rem", height: "26px", width: "64px"}} src={intermediateToken} alt="" />
                </>
                :
                <>
                    <img className="border-2 border-white rounded-full dark:border-gray-800" style={{marginBottom: "0.3rem", height: "26px", width: "64px"}} src={tokenFrom?.logoURI} alt="" />
                    <img style={{height: "24px", width: "24px", marginLeft: "-0.5rem"}} className="border-2 border-white rounded-full dark:border-gray-800" src={wrappedToken?.logoURI} alt="" />
                </>}

                </div>

                <svg width="100%" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
                    <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
                    </line>
                </svg>    
                </>
                : 
                <svg width="250" height="35" viewBox="850 0 300 200" xmlns="http://www.w3.org/2000/svg" className='text-gray-400'>
                    <line x1="0" x2="3000" y1="100" y2="100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeDasharray="1, 45">
                    </line>
                </svg>    
                }
                <img src={j === 0 ? intermediateToken : tokenTo?.logoURI}/>
                </div>
                <div className='flex flex-col' style={wrappedToken ? {marginLeft: "-14.5rem"} : {marginLeft: "-2.5rem"}}>
                    <p key={j+hop} className='text-gray-400'>{hop}</p>
                </div>
                </>
            ))}
        </>
            : 
            null
            }
            </div>
        ))}
    </>    
    }
    </>
  );
};

export default Routes;
