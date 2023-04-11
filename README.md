<p align="center">
  <a href="">
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
- [Liquidity Pool](#liquidity-pool) - Coming Soon
- [Bridge](#bridge) - Coming Soon

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
import { Swap } from "defi-ui-kit"

const SwapExample = () => {
  return (
    <Swap />
  )
}
```

Optional Parameters:

```
tokenA?: TokenMetadataResponse,
tokenB?: TokenMetadataResponse,
apiType?: '0x' | '1inch' | 'uniswapv2' | 'pancakeswap',
tokenList?: TokenMetadataResponse[],
primaryTokens?: TokenMetadataResponse[],
switchIcon?: "none" | React.ReactNode, 
variant?: "bidirectional" | "unidirectional"
```

### Swap Component Usage

- Token A and Token B: Default tokens 
- Primary Tokens: Common token bases for swaps
- Token List: List of tokens we want to swap 

<img src="https://defi-reserach.s3.eu-west-2.amazonaws.com/swap-usage.png"/>

### Swap API Types

The swap component has already been integrated with several types of APIs to choose from:

- 0x 
- 1Inch
- UniswapV2
- PancakeswapV2

<p align="center">
<img src="https://defi-reserach.s3.eu-west-2.amazonaws.com/Swap-api-types.png"/>
</p>

- Support/Implementation of features 

| API Type | Gas Estimation | Price Impact | Routes |
| -- | -- | -- | -- |
| 0x | ✅ | ✅ | ✅ |
| 1Inch | ✅ | ❌ | ✅ |
| UniswapV2 | ❌ | ✅ | ❌ |
| PancakeswapV2 | ❌ | ❌ | ❌ |

## Swap Routes

The swap supports all types of possible routes:

- Single swaps 
- MultiSource swaps
- MultiHop swaps

<img src="https://defi-reserach.s3.eu-west-2.amazonaws.com/Swap-Routes.png" /> 

### Calculations

#### Price Impact

$$\frac{\Delta_x}{x + \Delta_x} \times 100$$

where, 

$x$ is the reserve of Token A
