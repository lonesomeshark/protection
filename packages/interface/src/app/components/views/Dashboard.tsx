import React from "react";
import { Tab } from "@headlessui/react";

function Dashboard() {
    const basic = (
        <div className="basic-panel space-y-4">
            <div className="flex justify-between px-10 pt-10 items-center">
                <div className="space-y-2">
                    <div className="opacity-50">CURRENT HEALTH FACTOR</div>
                    <div className="text-5xl text-center">1.2</div>
                </div>
                <div className="pl-10"><svg width="52" height="24" viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807611 39.9792 0.807611 39.3934 1.3934C38.8076 1.97919 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z" fill="black" />
                </svg></div>
                <div className="space-y-2">
                    <div className="opacity-50">CUSTOM LIQUIDATION THRESHOLD</div>

                    {/* to be made input */}
                    <div className="text-5xl max-w-min ml-10" contentEditable="true">
                        1.01
                    </div>
                </div>
            </div>
            <div className="flex justify-center pb-8">
                <button className="text-white bg-purple px-3 py-2 rounded-md">Protect my assets</button>
            </div>
        </div>);


    return (
        <div className="dashboard max-w-7xl mx-auto px-6">
            <div className="md:grid grid-cols-3 mt-10 text-left gap-8">
                <div className="col-span-1 bg-secondary px-4 pt-4 pb-20 space-y-1">
                    <div className="text-lg opacity-50 pb-4">Total Aave Deposits in USD</div>
                    <div className="text-semibold text-5xl">$12</div>
                    <div className="text-red-type1">are not protected</div>
                </div>
                <div className="col-span-2 ">
                    <Tab.Group
                        defaultIndex={0}
                        onChange={index => {
                            console.log(index)
                        }}>
                        <Tab.List className="flex">
                            <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-md" : "border border-gray px-2 py-1 rounded-md"}>Basic</Tab>
                            <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-md" : "border border-gray px-2 py-1 rounded-md"}>Advanced Options</Tab>
                        </Tab.List>
                        <Tab.Panels className="bg-secondary">
                            <Tab.Panel>{basic}</Tab.Panel>
                            <Tab.Panel>Advanced Options</Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group></div>
            </div>
        </div>
    )
}

export default Dashboard;