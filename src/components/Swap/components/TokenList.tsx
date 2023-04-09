// import Image from 'next/image';
import { useEffect, useState } from 'react';
import Searchbar from './ui/search/Searchbar';
import { TokenMetadataResponse } from '..';
import { baseCurrencies } from '../data/tokens';
import React from 'react';

interface ITokenListProps {

    onSelect: (token: TokenMetadataResponse) => void,
    network: number | undefined,
    tokenList?: TokenMetadataResponse[] |undefined,
    primaryTokens?: TokenMetadataResponse[],
    apiType: string
}

const TOKEN_NUMBER = 50

const TokenList: React.FunctionComponent<ITokenListProps> = ({onSelect, network, tokenList, primaryTokens, apiType}) => {

    const tokens = tokenList ? tokenList : baseCurrencies
    const baseTokens = primaryTokens ? primaryTokens : baseCurrencies

    const [next, setNext] = useState(TOKEN_NUMBER);
    const [query, setQuery] = useState("");
    const [filteredTokens, setFilteredTokens] = useState<TokenMetadataResponse[]>([]);

    const handleTokenSelect = (token: TokenMetadataResponse) => {
        onSelect(token)
    }
    
    const handleMoreTokens = () => {
        setNext((prev) => prev + TOKEN_NUMBER);
    };

    const handleSearch = (searchValue: string) => {
        setQuery(searchValue);
    };

    const baseCurrenciesFiltered = baseTokens.filter((token) => {
        if ((apiType === "uniswapv2" && network != 1) || (apiType === "pancakeswap" && network != 56)) {
            return ""
        }
        else {
            return token.chainId === network
        }
    })

    useEffect(() => {
        if (tokens) {
            const filtered = tokens.filter((token) => {
                if ((apiType === "uniswapv2" && network != 1) || (apiType === "pancakeswap" && network != 56)) {
                    return ""
                }
                else {
                    return token.name.toLowerCase().includes(query.toLowerCase()) && token.chainId === network
                }
            });
            setFilteredTokens(filtered);
        }
    }, [query]);

  return (
    <>
    <Searchbar onSubmit={handleSearch} autofocus={true}/>
    <div className='grid grid-cols-4 text-white border-b border-gray-500 mt-4'>
        {baseCurrenciesFiltered.map((token) => (
            <div key={token.name} className='flex hover:bg-gray-700 py-4 px-3 rounded-lg' onClick={() => handleTokenSelect(token)}>
                <img src={token.logoURI} alt="Token Logo" width="0" height="0"
                sizes="100vw"
                className="w-[30px] h-auto" loading="lazy"/>
            <p className='text-white ml-4'>{token.symbol}</p>
            </div> 
        ))}
    </div>
    <div className='flex flex-col space-y-4 mt-6 h-[25rem] overflow-y-scroll'>
    {tokens && filteredTokens?.slice(0, next).map((token) => (
        <div key={token.name} className='flex hover:bg-gray-700 py-4 px-3 rounded-lg' onClick={() => handleTokenSelect(token)}>
            <img src={token.logoURI} alt="Token Logo" width="0"
                height="0"
                sizes="100vw"
                className="w-[30px] h-auto" loading="lazy"/>
            <p className='text-white ml-4'>{token.name}</p>
        </div>
    ))}
    {tokens && next < filteredTokens?.length && (
        <p
        className="mt-4 text-white text-center bg-[#161517a5] py-2 rounded-lg hover:bg-[#414141]"
        onClick={handleMoreTokens}
        >
            Load more
          </p>
        )}
    </div>
    </>
  );
};

export default TokenList;
