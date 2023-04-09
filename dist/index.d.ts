import React, { ReactNode } from 'react';

declare const Swap: React.FunctionComponent<ISwapProps>;
interface ISwapProps {
    tokenA?: TokenMetadataResponse;
    tokenB?: TokenMetadataResponse;
    apiType?: '0x' | '1inch' | 'uniswapv2' | 'pancakeswap';
    tokenList?: TokenMetadataResponse[];
    primaryTokens?: TokenMetadataResponse[];
    switchIcon?: "none" | React.ReactNode;
    variant?: "bidirectional" | "unidirectional";
}
interface TokenMetadataResponse {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    image?: string;
}

interface IDeFiUI {
    account: any;
    fetchSigner: any;
    signerPromise: any;
    chains: any;
    currentProvider: any;
    useSwitchNetwork: any;
}
declare const DeFiUIKitProvider: ({ children, config }: {
    children: ReactNode;
    config: IDeFiUI;
}) => JSX.Element;

export { DeFiUIKitProvider, Swap };
