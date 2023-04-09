import React, {createContext, ReactNode, useContext } from "react";

interface IDeFiUI {
  account: any,
  fetchSigner: any,
  signerPromise: any,
  chains: any,
  currentProvider: any,
  useSwitchNetwork: any
}

const DeFiUIKitContext = createContext<IDeFiUI>({
  account: null,
  fetchSigner: null,
  signerPromise: null,
  chains: null,
  currentProvider: null,
  useSwitchNetwork: null
});

export const DeFiUIKitProvider = ({ children, config }: { children: ReactNode, config: IDeFiUI}) => {


  return (
    <DeFiUIKitContext.Provider value={config}>
        {children}
    </DeFiUIKitContext.Provider>
  )
};

export const useDeFiUIKitContext = () => {
  const context = useContext(DeFiUIKitContext)
  if (context === undefined) throw new Error("useDeFiUIKitContext must be within an EthereumProvider")
  return context
}
