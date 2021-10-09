import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import ethIcon from "../../assets/eth.png";
import usdcIcon from "../../assets/usdc.png";
import daiIcon from "../../assets/dai.png";
import shield from "../../assets/shield.png";

function Dashboard() {
    const [ isProtected, setIsProtected ] = useState(false);
    const [ customThreshold, setCustomThreshold ] = useState(1.01);
    const deposits = [
        {
            asset: "ETH",
            assetIcon: ethIcon,
            value: "12,232.232",
            apy: "23%"
        },
        {
            asset: "USDC",
            assetIcon: usdcIcon,
            value: "12,232.232",
            apy: "23%"
        }
    ];

    const debts = [
        {
            asset: "DAI",
            assetIcon: daiIcon,
            value: "12,232.232",
            interest: "23%"
        }
    ];

    const depositView = deposits.map((item, index) => {
        return (
            <div key={index} className="grid grid-cols-3 pl-4 pr-16 py-2 border border-gray border-opacity-50 border-t-0 dark:text-white">
                <div className="text-left flex space-x-2">
                    <div><img src={item.assetIcon} alt="" /></div>
                    <div>{item.asset}</div>
                </div>
                <div className="lg:text-right">{item.value}</div>
                <div className="text-right">{item.apy}</div>
            </div>
        )
    });

    const debtView = debts.map((debt, index) => {
            return (
                <div key={index} className="grid grid-cols-3 py-2 pl-4 border border-gray border-opacity-50 border-t-0 dark:text-white">
                    <div className="text-left flex space-x-2">
                        <div><img src={debt.assetIcon} alt="" /></div>
                        <div>{debt.asset}</div>
                    </div>
                    <div className="text-left pl-0 sm:pl-8 lg:pl-0">{debt.value}</div>
                    <div className="lg:text-left sm:pl-10">{debt.interest}</div>
                </div>
            )
    });

    const basic = (
        <div className="basic-panel space-y-4">
            <div className="flex justify-between px-10 pt-10 items-center">
                <div className="space-y-2">
                    <div className="opacity-50 text-lg">Current Health Factor</div>
                    <div className="text-5xl text-center">1.2</div>
                </div>
                <div className="pl-10">
                    <svg width="52" height="24" viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807611 39.9792 0.807611 39.3934 1.3934C38.8076 1.97919 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z" fill="black" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <div className="opacity-50 text-lg pl-10">Current Liquidation Threshold</div>

                    {/* to be made input */}
                    <div className="text-5xl max-w-min ml-10" contentEditable="true" onChange={() => setCustomThreshold(customThreshold)}>
                        {customThreshold}
                    </div>
                </div>
            </div>
            <div className="flex justify-center pb-8">
                { !isProtected && <button className="text-white bg-purple px-3 py-2 rounded-md" onClick={() => setIsProtected(!isProtected)}>Protect my assets</button> }
                { isProtected && 
                <div className="flex space-x-4">
                    <button className="text-white bg-purple px-3 py-2 rounded-md" onClick={() => setIsProtected(!isProtected)}>Edit</button>
                    <button className="text-red-type1 border border-red-type1 px-3 py-3 rounded-md">Expose assets to risk</button>
                </div>}
            </div>
        </div>);


    return (
        <div className="dashboard max-w-7xl mx-auto px-6">
            <div className="md:grid grid-cols-3 mt-10 text-left gap-8 space-y-4 md:space-y-0">
                <div className="col-span-1 bg-secondary overflow-hidden rounded-md">
                
                    <div className="space-y-1 pt-4 pl-4 object-cover pb-4">
                        <div className="text-lg opacity-50 pb-4">Total Aave Deposits in USD</div>
                        <div className="text-semibold text-5xl">$12</div>
                        { !isProtected && <div className="text-red-type1">are not protected</div> }
                        { isProtected && <div className="text-green">are protected</div>}
                        {/* { isProtected && <div className="text-green">are protected</div> }   */}
                    </div>
                    { isProtected && <img src={shield} alt="protect" className="float-right object-none object-bottom relative -mt-6 z-5"/> }
                    
                </div>
                <div className="col-span-2">
                    <Tab.Group
                        defaultIndex={0}
                        onChange={index => {
                            console.log(index)
                        }}>
                        <Tab.List className="flex">
                            <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-t-md" : "border border-gray px-2 py-1 rounded-t-md dark:text-white"}>Basic</Tab>
                            <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-t-md" : "border border-gray px-2 py-1 rounded-t-md dark:text-white"}>Advanced Options</Tab>
                        </Tab.List>
                        <Tab.Panels className="bg-secondary rounded-b-md rounded-tr-md">
                            <Tab.Panel>{basic}</Tab.Panel>
                            <Tab.Panel><div className="py-24 text-center">Advanced Option</div></Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
            <div className="lg:flex mt-10 lg:space-x-8">
                <div className="space-y-4 max-w-screen-sm">
                    <div className="opacity-50 text-left dark:text-white">YOUR DEPOSITS</div>
                    <div>
                        <div className="flex justify-between space-x-24 bg-secondary pl-4 pr-16 py-2 border border-gray border-opacity-50 rounded-t-md font-bold">
                            <div>Assets</div>
                            <div>Value</div>
                            <div>APY</div>
                        </div>
                        {depositView}
                    </div>
                </div>
                <div className="space-y-4 max-w-screen-sm">
                    <div className="opacity-50 text-left dark:text-white">YOUR DEBTS</div>
                    <div>
                        <div className="flex justify-between space-x-24 bg-secondary pl-4 pr-16 py-2 border border-gray border-opacity-50 rounded-t-md font-bold">
                            <div>Assets</div>
                            <div>Value</div>
                            <div>Interests</div>
                        </div>
                        {debtView}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;