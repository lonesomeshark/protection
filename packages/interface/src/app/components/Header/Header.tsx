import React from "react";
import { Switch } from "@headlessui/react"

type Props = {
    address: string,
    network: string,
    balance: string,
    connected: boolean,
    isDark: boolean,
    toggleTheme: () => void
}
// function Header({ web3Modal, loadWeb3Modal, logoutOfWeb3Modal}) {
function Header({ address, network, balance, connected, isDark, toggleTheme }: Props) {
    return (
        <div className="dark:bg-black bg-white sticky top-0">
            <nav className="dark:text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-xl font-bold">Profitable Flash Loans</div>
                        <div className="hidden md:flex md:space-x-8 md:items-center">
                            {connected && <div>Network : {network}</div>}
                            {connected && <div>Balance : {balance} ETH</div>}
                            {connected && <div>Wallet Address : {address}</div>}
                            <div>
                                {connected ? (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="6" cy="6" r="6" fill="#34D399" />
                                </svg>) : (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="6" cy="6" r="6" fill="#FF0000" />
                                </svg>)}
                            </div>
                            <div>
                                <Switch
                                    checked={isDark}
                                    onChange={toggleTheme}
                                    className={`${ isDark ? 'bg-yellow' : 'bg-black'
                                        } relative inline-flex items-center h-6 rounded-full w-11`}
                                >
                                    
                                    <span
                                        className={`${ isDark ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block w-4 h-4 transform bg-white rounded-full`}
                                    />
                                    
                                </Switch>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )

}

export default Header;