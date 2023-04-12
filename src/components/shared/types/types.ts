export interface SwapPriceResponse {
    chainId: number,
    price: string,
    estimatedPriceImpact: string,
    value: string,
    gasPrice: string,
    gas: string,
    estimatedGas: string,
    protocolFee:string,
    minimumProtocolFee: string,
    buyTokenAddress: string,
    buyAmount: string,
    sellTokenAddress: string,
    sellAmount: string,
    sources: [],
    allowanceTarget: string,
    sellTokenToEthRate: string,
    buyTokenToEthRate: string,
    expectedSlippage: number,
    to?: string,
    data?:string
}

export interface TokenMetadataResponse {
    chainId: number,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURI: string,
    image?: string,
}

export interface Source {
    name: string,
    proportion: string,
    hops: [],
    intermediateToken: string
}