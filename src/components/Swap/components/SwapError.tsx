import * as React from 'react';

interface ISwapErrorProps {
    error: {
        reason: string,
        message: string
    } | any
}

const SwapError: React.FunctionComponent<ISwapErrorProps> = ({error}) => {
  return (
    <>
    {error ? 
    <div className="bg-red-900 text-center py-4 lg:px-4">
    <div className="p-2 bg-red-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
        <span className="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">Error</span>
        <span className="font-semibold mr-2 text-left flex-auto text-xs">
        {error.reason ? error.reason : JSON.stringify(error)}
        </span>
    </div>
    </div>
    : null}
    </>
  );
};

export default SwapError;
