import React, { useCallback, useEffect, useReducer } from "react";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, providers } from "ethers";
import { getChainData } from "../lib/utils";
import { IChainData } from "../lib/types"


const INFURA_ID = 'c8f14f02837e4808bfd1c647041a1eda';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID
    }
  }
};

let web3Modal: Web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions
  })
}

type StateType = {
  provider?: any
  web3Provider?: any
  address?: string
  chainId?: number
  balance: string
  chain?: IChainData | null
}

type ActionType =
  | {
    type: 'SET_WEB3_PROVIDER'
    provider?: StateType['provider']
    web3Provider?: StateType['web3Provider']
    address?: StateType['address']
    chainId?: StateType['chainId']
    balance?: StateType['balance']
    chain?: StateType['chain']
  }
  | {
    type: 'SET_ADDRESS'
    address?: StateType['address']
  }
  | {
    type: 'SET_CHAIN_ID'
    chainId?: StateType['chainId']
  }
  | {
    type: 'RESET_WEB3_PROVIDER'
  }
  | {
    type: 'SET_CHAIN_DATA'
    chain?: StateType['chain']
  }


const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: "",
  chainId: 0,
  balance: "",
  chain: null
}


function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_CHAIN_DATA':
      return {
        ...state,
        chain: action.chain
      }
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
        balance: action.balance as string,
      }
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      }
    case 'RESET_WEB3_PROVIDER':
      return initialState
    default:
      throw new Error()
  }
}

function Wallets() {

  // const [injectedProvider, setInjectedProvider] = useState();

  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, web3Provider, address, chainId, balance } = state;

  const connect = useCallback(async function () {
    // This is the initial `provider` that is returned when
    // using web3Modal to connect. Can be MetaMask or WalletConnect.
    const provider = await web3Modal.connect()

    // We plug the initial `provider` into ethers.js and get back
    // a Web3Provider. This will add on methods from ethers.js and
    // event listeners such as `.on()` will be different.
    const web3Provider = new providers.Web3Provider(provider)

    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()

    const bigBalance = await web3Provider.getBalance(address)
    const res = ethers.utils.formatEther(bigBalance)
    const balance = (+res).toFixed(3)



    console.log("the balance data ", balance)

    const network = await web3Provider.getNetwork()

    dispatch({
      type: 'SET_WEB3_PROVIDER',
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
      balance,
    })
  }, [dispatch])


  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      console.log("checking connection");
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        console.log("about to disconnect");
        await provider.disconnect()
      }
      dispatch({
        type: 'RESET_WEB3_PROVIDER',
      })
    },
    [ web3Provider, address]
  )

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])


  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts)
        if(accounts[0]){

          dispatch({
            type: 'SET_ADDRESS',
            address: accounts[0],
          })
        } else {
          dispatch({
            type: 'RESET_WEB3_PROVIDER'
          })
        }
      }

      const handleChainChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts)
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        })
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error)
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect])

  const chainData = getChainData(chainId)

  useEffect(()=>{
    dispatch({type: "SET_CHAIN_DATA", chain: chainData})
  },[chainData?.name])

  const deps = {connect, disconnect};
  const hook: [StateType, typeof deps ] = [state, deps];
  return hook;
}

export default Wallets;