import React, { useState } from "react";
import { Switch } from "@headlessui/react"
import { NavLink } from "react-router-dom";
import { MenuIcon } from "@heroicons/react/outline";
import logo from "../../assets/logo.png";

type Props = {
    address: string,
    network: string,
    balance: string,
    connected: boolean,
    isDark: boolean,
    toggleTheme: () => void,
    connect: () => void,
    disconnect: () => void,
    openMenu: () => void,
}
// function Header({ web3Modal, loadWeb3Modal, logoutOfWeb3Modal}) {
function Header({ address, network, balance, connected, isDark, toggleTheme, connect, disconnect, openMenu }: Props) {
    return (
        <div className="dark:bg-black bg-secondary sticky top-0 z-10">
            <nav className="dark:text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-2xl font-semibold flex items-center space-x-2"><div className="rounded-md bg-purple"><img src={logo} alt="logo" className="transform scale-50 scale-x-75" /></div><div>LonesomeShark</div></div>
                        <div className="hidden md:flex md:space-x-8 md:items-center">
                            {/* {connected && <div>Network : {network}</div>}
                            {connected && <div>Balance : {balance} ETH</div>} */}

                            <NavLink to={"/home"}>Home</NavLink>
                            <NavLink to={"/dashboard"}>Products</NavLink>
                            <NavLink to={"/about-us"}>About us</NavLink>
                            {!connected && <button className="bg-purple text-white px-4 py-2 rounded-md" onClick={connect}>Connect</button>}
                            {connected && <button className="bg-purple text-white px-4 py-2 rounded-md" onClick={disconnect}>{address}</button>}
                            {/* <div>
                                {connected ? (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="6" cy="6" r="6" fill="#34D399" />
                                </svg>) : (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="6" cy="6" r="6" fill="#FF0000" />
                                </svg>)}
                            </div> */}
                            <div>
                                <Switch
                                    checked={isDark}
                                    onChange={toggleTheme}
                                    className={`${isDark ? 'bg-yellow' : 'bg-black'
                                        } relative inline-flex items-center h-6 rounded-full w-11`}
                                >

                                    <span
                                        className={`${isDark ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block w-4 h-4 transform bg-white rounded-full`}
                                    />

                                </Switch>
                            </div>
                        </div>
                        <div className="md:hidden flex items-center space-x-2">
                            <div>
                                {!connected && <button className="bg-purple text-white px-4 py-2 rounded-md" onClick={connect}>Connect</button>}
                                {connected && <button className="border border-purple text-purple px-1.5 py-1 rounded-md text-sm" onClick={disconnect}>{address}</button>}
                            </div>
                            <div>
                                <button onClick={openMenu}><MenuIcon height="20" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )

}

export default Header;