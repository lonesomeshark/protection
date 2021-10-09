import React, { useCallback, useEffect, useReducer, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import useWallets from "../hooks/wallets";
import { ellipseAddress } from "../lib/utils";
import { useAppDispatch, useAppSelector } from "../hooks/redux"
import { setIsDark } from "../slices/theme"
import subscribersArtifact from "@lonesomeshark/core/deployed/kovan/Subscribers.json";
// the types are awesome to work with but in react cannot make it work
// import { Subscribers, Subscribers__factory} from "@lonesomeshark/core/typechain"


//can use this in the meantime
const subscribers = { address:subscribersArtifact.address,
  abi: subscribersArtifact.abi,
  bytecode: subscribersArtifact.bytecode
}
// example but will not work
// const s =  new Subscribers__factory().attach(subscribers.address)

import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { AboutUs, Dashboard, Home } from "./components";

function App() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(state => state.theme)
  const [walletState, { connect, disconnect }] = useWallets()
  const { provider, web3Provider, address, chainId, balance, chain } = walletState;
  const toggleTheme = () => {
    dispatch(setIsDark(!isDark))
  }


  return (
    <div className={`App ${isDark ? 'dark' : ''}`}>
      <div className=" bg-white dark:bg-black-type1 min-h-screen pb-24">
        <Router>
          <Header
            address={ellipseAddress(address)}
            network={chain?.network || ""}
            balance={balance}
            connected={web3Provider !== null}
            isDark={isDark}
            toggleTheme={toggleTheme}
            connect={connect}
            disconnect={disconnect}
          />
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                return <Redirect to="/home" />;
              }}
            />
            <Route path="/home" exact>
              <Home />
            </Route>
            <Route path="/dashboard" exact>
              <Dashboard />
            </Route>
            <Route path="/about-us" exact>
              <AboutUs />
            </Route>
          </Switch>
        </Router>

      </div>

    </div>
  );
}

export default App;