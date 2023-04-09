<p align="center">
  <a href="https://getbootstrap.com/">
    <img src="https://defi-reserach.s3.eu-west-2.amazonaws.com/defi-ui-kit-logo.png" alt="defi-ui-kit logo" />
  </a>
</p>

<h3 align="center">DeFi UI Kit</h3>

<p align="center">
  A React component library to streamline DeFi platform building
  <br />
</p>

## Table of contents

- [Quick start](#quick-start)
- [Swap](#swap)

## Quick Start

### Installation

```
npm install defi-ui-kit
```

### Configuration

To be used in conjuction with Wagmi, with configuration at the App level

```jsx
import { configureChains, createClient, useSwitchNetwork, WagmiConfig } from "wagmi"
import { mainnet, bsc, arbitrum, optimism, polygon } from '@wagmi/core/chains'
import {alchemyProvider} from "wagmi/providers/alchemy"
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { fetchSigner, getAccount, getProvider} from '@wagmi/core'
import { DeFiUIKitProvider } from "defi-ui-kit"


const {chains, provider} = configureChains(
  [mainnet, arbitrum, optimism, polygon, bsc], 
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `${process.env.BSC_API_URL}`,
      }),
    }),
  ]
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors, 
  provider
})

const account = getAccount()
const signerPromise = fetchSigner()
const currentProvider = getProvider()

const DeFiUIConfig = {
  account,
  fetchSigner,
  signerPromise,
  chains,
  currentProvider,
  useSwitchNetwork
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
        <DeFiUIKitProvider config={DeFiUIConfig}>
            <Component {...pageProps} />
        </DeFiUIKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
```

## Swap

Integrated swap components

<img src="https://defi-reserach.s3.eu-west-2.amazonaws.com/swap-showcase.png" />

```jsx
 <Swap 
    apiType='1inch'
    tokenA={baseCurrencies[0]}
    tokenB={baseCurrencies[1]}
    tokenList={baseCurrencies}
    primaryTokens={baseCurrencies}
    />
```

Props:

```
tokenA?: TokenMetadataResponse,
tokenB?: TokenMetadataResponse,
apiType?: '0x' | '1inch' | 'uniswapv2' | 'pancakeswap',
tokenList?: TokenMetadataResponse[],
primaryTokens?: TokenMetadataResponse[],
switchIcon?: "none" | React.ReactNode, 
variant?: "bidirectional" | "unidirectional"
```
