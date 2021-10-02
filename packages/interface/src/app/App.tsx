import React, { useCallback, useEffect, useReducer, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import useWallets from "../hooks/wallets";
import { ellipseAddress } from "../lib/utils";
import { useAppDispatch, useAppSelector} from "../hooks/redux"
import { setIsDark } from "../slices/theme"

function App() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(state => state.theme)
  const [ walletState, {connect, disconnect}] = useWallets()
  const { provider, web3Provider, address, chainId, balance, chain } = walletState;

  const toggleTheme = () => {
    dispatch(setIsDark(!isDark))
  }

  return (
    <div className={`App ${isDark ? 'dark' : ''}`}>
      <div className=" bg-secondary dark:bg-primary h-screen">
      <Header
      address={ellipseAddress(address)}
      network={chain?.network || ""}
      balance={balance}
      connected={web3Provider !== null}
      isDark={isDark}
      toggleTheme={toggleTheme}
      />
      <div className="mt-10">
        {chain?.network? (
          <button className="bg-red text-white py-2 px-4 rounded-md" type="button" onClick={disconnect}>
            Disconnect
          </button>
        ) : (
          <button className="bg-green text-white py-2 px-4 rounded-md" type="button" onClick={connect}>
            Connect
          </button>
        )}
      </div>
      </div>
      
    </div>
  );
}

export default App;