import React, { useCallback, useEffect, useReducer, useState, useRef, Fragment } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import useWallets from "../hooks/wallets";
import { ellipseAddress } from "../lib/utils";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setIsDark } from "../slices/theme";
import subscribersArtifact from "@lonesomeshark/core/deployed/kovan/Subscribers.json";
import { Dialog, Transition } from '@headlessui/react';
import { Switch as SwitchButton } from "@headlessui/react";
import { ChakraProvider } from "@chakra-ui/react";
// the types are awesome to work with but in react cannot make it work
// import { Subscribers, Subscribers__factory} from "@lonesomeshark/core/typechain"


//can use this in the meantime
const subscribers = {
  address: subscribersArtifact.address,
  abi: subscribersArtifact.abi,
  bytecode: subscribersArtifact.bytecode
}
// example but will not work
// const s =  new Subscribers__factory().attach(subscribers.address)

import { BrowserRouter as Router, Route, Switch, Redirect, Link } from "react-router-dom";
import { AboutUs, Dashboard, Home } from "./components";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef(null)
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(state => state.theme)
  const [walletState, { connect, disconnect }] = useWallets()
  const { provider, web3Provider, address, chainId, balance, chain } = walletState;
  const toggleTheme = () => {
    dispatch(setIsDark(!isDark))
  };

  return (
    <ChakraProvider>
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
              openMenu={() => setIsOpen(true)}
            />

            <Transition.Root show={isOpen} as={Fragment}>
              <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto md:hidden" initialFocus={cancelButtonRef} onClose={setIsOpen}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                  </Transition.Child>

                  {/* This element is to trick the browser into centering the modal contents. */}
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                  </span>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  >
                    <div className="inline-block bg-gray rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle sm:max-w-lg w-full">
                      <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div> */}
                          <div className="mt-3 text-center space-y-3">
                            <div className="cursor-pointer hover:text-red" onClick={() => setIsOpen(false)}><Link to="/home">Home</Link></div>
                            <div className="cursor-pointer hover:text-red" onClick={() => setIsOpen(false)}><Link to="/dashboard">Products</Link></div>
                            <div className="cursor-pointer hover:text-red" onClick={() => setIsOpen(false)}><Link to="/about-us">About us</Link></div>
                            <div className="pt-8">
                              <SwitchButton
                                checked={isDark}
                                onChange={toggleTheme}
                                className={`${isDark ? 'bg-yellow' : 'bg-black'
                                  } relative inline-flex items-center h-6 rounded-full w-11`}
                              >

                                <span
                                  className={`${isDark ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block w-4 h-4 transform bg-white rounded-full`}
                                />

                              </SwitchButton>
                            </div>
                            {/* <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                            Deactivate account
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to deactivate your account? All of your data will be permanently removed.
                              This action cannot be undone.
                            </p>
                          </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsOpen(false)}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>



            <Switch>
              <Route
                exact
                path="/"
                render={() => {
                  return <Redirect to="/home" />;
                }}
              />
              <Route path="/home" exact>
                <Home connected={web3Provider !== null}/>
              </Route>
              <Route path="/dashboard" exact>
                {web3Provider ? <Dashboard /> : <Redirect to="/home" />}
              </Route>
              <Route path="/about-us" exact>
                <AboutUs />
              </Route>
              <Redirect to='/' />
            </Switch>
          </Router>

        </div>

      </div>
    </ChakraProvider>

  );
}

export default App;