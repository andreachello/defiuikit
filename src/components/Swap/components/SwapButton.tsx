import * as React from 'react';
import Spinner from './ui/loaders/Spinner';
import cx from "classnames"

interface ISwapButtonProps {
    canSwap: boolean | 0 | null | "", 
    swapFunction: () => void, 
    isLoading: boolean, 
    isFilledOut: boolean | 0 | null | "", 
    tokenFromBalance: number | undefined, 
    amountFrom: number | string,
    tokenSymbol: string | undefined
}

const SwapButton: React.FunctionComponent<ISwapButtonProps> = ({
    canSwap, 
    swapFunction, 
    isLoading, 
    isFilledOut, 
    tokenFromBalance, 
    amountFrom, 
    tokenSymbol
}) => {
  return (
    <button 
    disabled={!canSwap}
    className={cx('text-white text-center rounded-md py-2 w-full', 
    canSwap ? "cursor-pointer bg-indigo-500" : "cursor-not-allowed bg-gray-600")}
    onClick={swapFunction}>
    {isLoading ? <Spinner /> : 
    isFilledOut && (!tokenFromBalance || amountFrom > tokenFromBalance) ?
    `Insufficient Balance of ${tokenSymbol}` : "Swap"}
    </button>
  );
};

export default SwapButton;
