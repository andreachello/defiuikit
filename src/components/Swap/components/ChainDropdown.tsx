// import Image from "next/image";
import React, { useEffect, useState } from "react";
import {providerList} from "../../shared/data/providers"
import { useDeFiUIKitContext } from "../../shared/context/DeFiUIKitContext";

interface IDropdownProps {
  resetAll: () => void,
  apiType: string,
  chain: ChainType
}

interface ProviderType {
    name: string,
    icon: string,
}

type ChainType = {
  id: number;
  name: string;
  network: string;
  nativeCurrency: string;
}

const ChainDropdown: React.FunctionComponent<IDropdownProps> = ({resetAll, apiType, chain}) => {
    const [provider, setProvider] = useState<ProviderType>();
    const [isOpen, setIsOpen] = useState(false);
    const {useSwitchNetwork} = useDeFiUIKitContext()
  
    const { switchNetwork } =
      useSwitchNetwork();
      
    useEffect(() => {
      
        // TODO when switching change currencies shows in inputs
      const currentChain = providerList.find(
        (provider) => provider.name === chain?.name
      );

      const rightNetwork = (apiType === "uniswapv2" && chain?.name.toLowerCase() != "ethereum") || (apiType === "pancakeswap" && chain?.name != "BNB Smart Chain") ? {name: "Wrong Network", icon: ""}: currentChain
  
      setProvider(rightNetwork);
      resetAll()
    }, [chain]);
  
    const handleOpen = () => {
        setIsOpen((prev) => !prev)
    }

    const filteredProviderList = providerList.filter(
      (provider) => {
        if (apiType === "uniswapv2") {
          return provider.name.toLowerCase() === "ethereum"
        } else if (apiType === "pancakeswap") {
          return provider.name === "BNB Smart Chain"
        } else {
          return provider
        }
      }
    )

    const handleProvider = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const newProviderName = e.currentTarget.getAttribute("value");
        if (newProviderName) {
          const newProvider = providerList.find(
            (provider) => provider.name === newProviderName
          );
          if (newProvider) {
              switchNetwork?.(newProvider.id)
          }
        }
        setIsOpen(false);
      };

    return (
    <>
    <button 
        onClick={handleOpen}
        className="text-white font-medium rounded-lg text-sm py-2.5 text-center inline-flex items-center space-x-2" type="button">
            {provider?.icon && <img src={provider?.icon} width={20} height={30} alt="provider icon"/>}
            <p>{provider?.name}</p>
            <svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
    
    {isOpen &&
        <div id="dropdown" className="z-10 mt-12 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-[#1f1f21] absolute">
        <ul className="mt-1 py-1 text-sm text-gray-700 dark:text-gray-200 space-y-2" aria-labelledby="dropdownDefaultButton">
            {filteredProviderList.map((provider) => (
                <li key={provider.name} onClick={handleProvider} value={provider.name} className="p-2 flex space-x-2 hover:bg-[#28282a] cursor-pointer">
                    {provider?.icon && <img src={provider?.icon} width={20} height={30} alt="provider icon"/>}
                    <p>{provider?.name}</p>
                </li>
            ))}
        </ul>
        </div>
    }
    </>
  );
};

export default ChainDropdown;
