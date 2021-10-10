import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import ethIcon from "../../assets/eth.png";
import usdcIcon from "../../assets/usdc.png";
import daiIcon from "../../assets/dai.png";
import shield from "../../assets/shield.png";
import { ArrowRightIcon } from "@heroicons/react/outline";
// import subscribersArtifact from "@lonesomeshark/core/deployed/kovan/Subscribers.json";

import { ethers } from "ethers";
import { Subscribers } from '@lonesomeshark/core/typechain';

const getSubscribers = (network: 'kovan') => {
    const s = require(`@lonesomeshark/core/deployed/${network}/Subscribers.json`);

    return {
        address: s.address,
        abi: s.abi,
        bytecode: s.bytecode
    }
}
interface UserReserveData {
    currentATokenBalance: number //ethers.BigNumber;
    currentStableDebt: number //ethers.BigNumber;
    currentVariableDebt: number //ethers.BigNumber;
    principalStableDebt: number // ethers.BigNumber;
    scaledVariableDebt: number //ethers.BigNumber;
    stableBorrowRate: number //ethers.BigNumber;
    liquidityRate: number //ethers.BigNumber;
    stableRateLastUpdated: number //ethers.BigNumber;
    usageAsCollateralEnabled: boolean;
    token: string,
    symbol: string
}
interface UserPosition {
    totalCollateralETH: number,
    totalDebtETH: number,
    availableBorrowsETH: number,
    currentLiquidationThreshold: number,
    ltv: number,
    healthFactor: number
}

const subscribers = getSubscribers("kovan");
const icons = {
    "ETH": ethIcon,
    "USDC": usdcIcon
}
function Dashboard() {
    const [isProtected, setIsProtected] = useState(false);
    const [atIndex, setAtIndex] = useState(0);
    const [customThreshold, setCustomThreshold] = useState(1.01);
    const [userData, setUserData] = useState<UserReserveData[]>();
    const [userPosition, setUserPosition] = useState<UserPosition>()


    // contract interaction
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = (new ethers.Contract(subscribers.address, subscribers.abi, signer)) as Subscribers;

    useEffect(() => {
        contract.getUserData()
            .then((data) => {
                console.log("return from get user data:", data)
                const d: UserReserveData[] = data[0].map((d) => {
                    return {
                        "currentATokenBalance": Number(ethers.utils.formatEther(d.currentATokenBalance)),
                        "currentStableDebt": Number(ethers.utils.formatEther(d.currentStableDebt)),
                        "currentVariableDebt": Number(ethers.utils.formatEther(d.currentVariableDebt)),
                        "principalStableDebt": Number(ethers.utils.formatEther(d.principalStableDebt)),
                        "scaledVariableDebt": Number(ethers.utils.formatEther(d.scaledVariableDebt)),
                        "stableBorrowRate": Number(ethers.utils.formatEther(d.stableBorrowRate)),
                        "liquidityRate": Number(ethers.utils.formatEther(d.liquidityRate)),
                        "stableRateLastUpdated": Number(ethers.utils.formatEther(d.stableRateLastUpdated)),
                        "usageAsCollateralEnabled": d.usageAsCollateralEnabled,
                        "token": d.token,
                        "symbol": d.symbol
                    }});
                const userPosition = {
                      currentLiquidationThreshold: Number(
                        ethers.utils.formatEther(data.currentLiquidationThreshold)
                      ),
                      healthFactor: Number(ethers.utils.formatEther(data.healthFactor)),
                      availableBorrowsETH: Number(ethers.utils.formatEther(data.availableBorrowsETH)),
                      ltv: Number(ethers.utils.formatEther(data.ltv)),
                      totalCollateralETH: Number(ethers.utils.formatEther(data.totalCollateralETH)),
                      totalDebtETH: parseToNumber(data.totalDebtETH),
                }
                console.log("parsed data is: ",d);
                console.log("user position", userPosition)
                    setUserData(d);
                    setUserPosition(userPosition)

            })
            .catch(e => {
                console.log("error getting getUserData")
                console.error(e)
            });

    }, [])
    interface IDeposit {
        asset: "ETH" | string,
        assetIcon: typeof ethIcon,
        value: string,
        apy: string
    }
    const filterDeposit = (d: UserReserveData) => d.currentATokenBalance;

    // might need to update it
    const parseDeposit = (d: UserReserveData): IDeposit => ({
        asset: d.symbol,
        assetIcon: (icons as any)[d.symbol] || ethIcon,
        value: (d.currentATokenBalance).toFixed(3) + "",
        apy: (d.liquidityRate).toFixed(3) + "%"
    })

    const deposits = userData && userData.length > 0
        ? userData?.filter(filterDeposit).map(parseDeposit)
        : [
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

    const mockhistory = [
        {
            timestamp: "10.10.2021 06:30",
            liquidated: "ETH,DAI,YFI",
            fees: "0.05 ETH",
            collateral: "$ 12,232.34324",
            transactionHash: "0xc1234wdsdcsas1233dasdasd"
        },
        {
            timestamp: "10.11.2021 06:30",
            liquidated: "UNI,BAT",
            fees: "0.05 ETH",
            collateral: "$ 12,232.34324",
            transactionHash: "0xc1234wdsdcsas1233dasdasd"
        }
    ];

const depositView = deposits ? deposits.map((item, index) => {
    return (
        <div key={index} className="grid grid-cols-3 pl-4 pr-16 py-2 border border-gray border-opacity-50 border-t-0 dark:text-white">
            <div className="text-left flex space-x-2">
                <div><img src={item.assetIcon} alt="" /></div>
                <div>{item.asset}</div>
            </div>
            <div className="lg:text-right">{(item.value)}</div>
            <div className="text-right">{item.apy}</div>
        </div>
    )
}) : null;

const debtView = debts ? debts.map((debt, index) => {
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
}) : null;

const historyView = mockhistory ? mockhistory.map((item, index) => {
    return (
        <div key={index} className="grid grid-cols-5 py-3 pl-4 border border-gray border-opacity-50 border-t-0 dark:text-white dark:bg-black-type1">
            <div className="text-left flex space-x-2">{item.timestamp}</div>
            <div className="text-left pl-0 sm:pl-8 lg:pl-0">{item.liquidated}</div>
            <div className="lg:text-left sm:pl-10">{item.fees}</div>
            <div className="text-left pl-4">{item.collateral}</div>
            <div className="lg:text-left">{item.transactionHash}</div>
        </div>
    )
}) : null;

const basic = (
    <div className="basic-panel space-y-4">
        <div className="flex justify-between px-10 pt-10 pb-2 items-center">
            <div className="space-y-2">
                <div className="opacity-50 text-lg">Current Health Factor</div>
                <div className="text-5xl text-center">1.2</div>
            </div>
            <div className="lg:pl-20 pl-10">
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
            <div className="bg-purple flex rounded-md px-3 py-2 space-x-2">
                    <div><button className="text-white bg-purple  rounded-md" onClick={() => setAtIndex(1)}> Next</button></div>
                    <div className="text-white flex items-center"><ArrowRightIcon height="20" /></div>
                </div>
            {/* {isProtected &&
                <div className="flex space-x-4">
                    <button className="text-white bg-purple px-3 py-2 rounded-md" onClick={() => setIsProtected(!isProtected)}>Edit</button>
                    <button className="text-red-type1 border border-red-type1 px-3 py-3 rounded-md">Expose assets to risk</button>
                </div>} */}
        </div>
    </div>);

const gasLimitTab = (<div className="pt-6 pl-4 pb-11">
    <div className="pb-2 opacity-50">Set your gas limit</div>
    <div className="pb-8 opacity-50 text-5xl max-w-min" contentEditable="true">21000</div>
    <div>
        <button className="text-white bg-purple px-3 py-2 rounded-md" onClick={() => setIsProtected(!isProtected)}>Finish & protect my assets</button></div>
</div>);

const dashboard = (
    <div>
        <div className="md:grid grid-cols-3 mt-10 text-left gap-8 space-y-4 md:space-y-0">
            <div className="col-span-1 bg-secondary overflow-hidden rounded-md">

                <div className="space-y-1 pt-4 pl-4 object-cover pb-4">
                    <div className="text-lg opacity-50 pb-4">Total Aave Deposits in ETH</div>
                    <div className="text-semibold text-5xl">{userPosition?.totalDebtETH || 0} ETH</div>
                    {!isProtected && <div className="text-red-type1">are not protected</div>}
                    {isProtected && <div className="text-green">are protected</div>}
                    {/* { isProtected && <div className="text-green">are protected</div> }   */}
                </div>
                {isProtected && <img src={shield} alt="protect" className="float-right object-none object-bottom relative -mt-10 z-5" />}

            </div>
            <div className="col-span-2">
                <Tab.Group
                    defaultIndex={atIndex}
                    onChange={index => {
                        console.log(index)
                    }}>
                    <Tab.List className="flex">
                        <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-t-md" : "border border-gray px-2 py-1 rounded-t-md dark:text-white"}>1. Set your threshold</Tab>
                        <Tab className={({ selected }) => selected ? "border border-gray px-2 py-1 text-purple border-b-0 rounded-t-md" : "border border-gray px-2 py-1 rounded-t-md dark:text-white"}>2. Gas Limit</Tab>
                    </Tab.List>
                    <Tab.Panels className="bg-secondary rounded-b-md rounded-tr-md">
                        <Tab.Panel>{basic}</Tab.Panel>
                        <Tab.Panel>{gasLimitTab}</Tab.Panel>
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
);

const history = (<div className="pt-6 min-w-max">
    <div className="flex justify-between space-x-24 bg-secondary pl-4 pr-16 py-2 border border-gray border-opacity-50 rounded-t-md font-semibold">
        <div>Time stamp</div>
        <div>Assets Liquidated</div>
        <div>Transaction fees</div>
        <div>Collateral sent (USD)</div>
        <div>Transaction hash</div>
    </div>
    {historyView}
</div>);


return (
    <div className="dashboard max-w-7xl mx-auto px-6">
        <Tab.Group
            defaultIndex={0}
            onChange={index => {
                console.log(index)
            }}>
            <Tab.List className="flex">
                <Tab className={({ selected }) => selected ? "px-2 py-1 text-purple font-semibold" : "px-2 py-1 dark:text-white font-semibold"}>Dashboard</Tab>
                <Tab className={({ selected }) => selected ? "px-2 py-1 text-purple font-semibold" : "px-2 py-1 dark:text-white font-semibold"}>History</Tab>
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel>{dashboard}</Tab.Panel>
                <Tab.Panel>{history}</Tab.Panel>
            </Tab.Panels>
        </Tab.Group>


    </div>
)
}

export default Dashboard;


function parseToNumber(b: ethers.BigNumber, decimals = 18){
    const val = ethers.utils.formatUnits(b, decimals);
    const parsedVal = parseFloat(val);
    return Number(parsedVal.toFixed(3));

}