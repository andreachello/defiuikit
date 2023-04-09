import React from 'react';
import { useEffect, useState } from 'react';
import cx from "classnames"
import {BsChevronDown} from "react-icons/bs"

import Modal from './ui/modal/Modal';
import TokenList from './TokenList';
import { TokenMetadataResponse } from '../Swap';

type ChainType = {
    id: number;
    name: string;
    network: string;
    nativeCurrency: string;
}

interface ITokenSelectionProps {
    onTokenSelect: (token: TokenMetadataResponse, balance: number) => void,
    onAmountSelect?: (value: number) => void,
    getPrice: () => void,
    amountTo?: number,
    amountFrom?: number,
    token: TokenMetadataResponse | null,
    disabled?: boolean,
    tokenBalance: number,
    tokenPrice: string,
    tokenList: TokenMetadataResponse[] | undefined,
    primaryTokens: TokenMetadataResponse[] |undefined,
    apiType: string,
    chain: ChainType
}

const TokenSelection: React.FunctionComponent<ITokenSelectionProps> = ({onTokenSelect, onAmountSelect, getPrice, amountTo, amountFrom, token, disabled, tokenBalance, tokenList, primaryTokens, tokenPrice, apiType, chain}) => {
    const [shouldShowModal, setShouldShowModal] = useState(false)
    const [value, setValue] = useState<number | string>("")

    const getMaxAmount = () => {
        if (token && tokenBalance >= 0 && onAmountSelect) {
            setValue(tokenBalance)
            onAmountSelect(tokenBalance);
        }
    }

    const handleTokenSelect = async(token: TokenMetadataResponse) => {
        onTokenSelect(token, Number(tokenBalance))
        setShouldShowModal(false)
    }

    const handleAmountSelect = (e:React.ChangeEvent<HTMLInputElement>) => {
       if (amountTo) return
       setValue(e.target.value)
       if (onAmountSelect) {
           onAmountSelect(Number(e.target.value))
       }
    }

    useEffect(() => {
        if (amountFrom === 0) {
            setValue(0)
        }
    }, [amountFrom])


  return (
    <div className='flex mt-4 py-5 pl-4 rounded-lg bg-[#1d1d1e] justify-between'>
        <div className='cursor-pointer rounded-xl hover:bg-[#2b2b2c]'>
            <Modal
                title='Select a Token'
                shouldShow={shouldShowModal}
                onRequestClose={() => {
                setShouldShowModal(false)
                }}>

                <TokenList tokenList={tokenList} onSelect={handleTokenSelect} network={chain?.id} primaryTokens={primaryTokens} apiType={apiType}/>
            </Modal>
            <div className='text-white' onClick={() => setShouldShowModal(!shouldShowModal)}>
                {token ? 
                <>
                <div className='flex space-x-2'>
                    <img src={token.logoURI ? token.logoURI  : token.image ? token.image : ""} alt="Token Logo" width={25} height={25} />
                    <p>{token.symbol}</p>
                </div>
                <p className='text-xs mt-2 text-gray-400'>Balance: {tokenBalance} 
                <span> {tokenBalance > 0 && tokenPrice ? '($'+(tokenBalance * Number(tokenPrice)).toFixed(2)+")" : null}</span>
                </p>
                </>
                : <p className='flex'>Select Token <BsChevronDown className='mt-1 ml-1'/></p>}
            </div>
        </div>
        <div>
        <input 
            type="number"
            className={cx('rounded-lg p-1 pl-2 text-right bg-[#1d1d1e] w-fit text-white', 
            onAmountSelect ? "": "cursor-not-allowed")} 
            value={amountTo ? amountTo : value}
            placeholder={"0"}
            onChange={handleAmountSelect}
            onBlur={getPrice}
            disabled={disabled ? disabled : false}
            />
        <p className='text-right text-gray-500 cursor-pointer' onClick={getMaxAmount}>Max</p>
        </div>
    </div>
  );
};

export default TokenSelection;
