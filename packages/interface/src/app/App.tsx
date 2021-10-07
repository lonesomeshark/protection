import React, { useCallback, useEffect, useReducer, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import useWallets from "../hooks/wallets";
import { ellipseAddress } from "../lib/utils";
import { useAppDispatch, useAppSelector } from "../hooks/redux"
import { setIsDark } from "../slices/theme"

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
      <div className=" bg-white dark:bg-primary h-screen">
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