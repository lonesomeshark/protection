import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import ethIcon from "../../assets/eth.svg";
import usdcIcon from "../../assets/usdc.png";
import daiIcon from "../../assets/dai.svg";
import batIcon from "../../assets/BAT.svg";
import linkIcon from "../../assets/link.svg";
import inchIcon from "../../assets/1INCH.svg";
import wbtcIcon from "../../assets/WBTC.svg";
import shield from "../../assets/shield.png";
import { Tab as ChakraTab, Tabs, TabList, TabPanel, TabPanels } from "@chakra-ui/tabs";
import { Progress } from "@chakra-ui/react";
import { CircularProgress } from "@chakra-ui/react"

import { ethers } from "ethers";
import { Subscribers, IERC20, LoneSomeSharkMonitor, KeeperRegistryBaseInterface, PaybackLoan } from '@lonesomeshark/core/typechain';

import ierc20Artifact from "@lonesomeshark/core/artifacts/@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json"
import registryArtifact from "@lonesomeshark/core/artifacts/contracts/interfaces/KeeperRegistryInterface.sol/KeeperRegistryBaseInterface.json"


const getContract = (contract: "LoneSomeSharkMonitor" | "Subscribers", network: 'kovan') => {
    const s = require(`@lonesomeshark/core/deployed/${network}/${contract}.json`);
    return {
        address: s.address,
        abi: s.abi,
        bytecode: s.bytecode
    }
}
interface IUserReserveData {
    currentATokenBalance: number
    currentStableDebt: number
    currentVariableDebt: number
    principalStableDebt: number
    scaledVariableDebt: number
    stableBorrowRate: number
    liquidityRate: number
    stableRateLastUpdated: number
    usageAsCollateralEnabled: boolean
    token: string
    symbol: string
    variableBorrowRate: number
    averageStableBorrowRate: number
}
enum EStatus {
    PAUSED,
    REGISTERED,
    ACTIVATED
}
interface IUserAccount {
    status: EStatus;
    payback: string;
    threshold: number;
    collaterals: string[] //token addresses
}
interface IUserPosition {
    totalCollateralETH: number,
    totalDebtETH: number,
    availableBorrowsETH: number,
    currentLiquidationThreshold: number,
    ltv: number,
    healthFactor: number
}

const linkAddress = "0xa36085F69e2889c224210F603D836748e7dC0088";

const subscribers = getContract("Subscribers", "kovan");
const lonesomeshark = getContract("LoneSomeSharkMonitor", "kovan");
const icons = {
    "ETH": ethIcon,
    "USDC": usdcIcon,
    "AAVE": ethIcon,
    "BAT": batIcon,
    "1INCH": inchIcon,
    //  "BUSD": ethIcon,
    "DAI": daiIcon,
    "ENJ": ethIcon,
    "KNC": ethIcon,
    "LINK": linkIcon,
    "MANA": ethIcon,
    "MKR": ethIcon,
    "REN": ethIcon,
    "SNX": ethIcon,
    "sUSD": usdcIcon,
    "TUSD": ethIcon,
    "USDT": ethIcon,
    "WBTC": wbtcIcon,
    "WETH": ethIcon,
    "YFI": ethIcon,
    "ZRX": ethIcon,
    "UNI": ethIcon,
    "AMPL": ethIcon,
}
interface IDeposit {
    asset: "ETH" | string,
    assetIcon: typeof ethIcon,
    value: string,
    apy: string
}

interface IDebt {
    asset: "ETH" | string,
    assetIcon: typeof ethIcon,
    value: string,
    interest: string
}

const filterDeposit = (d: IUserReserveData) => d.currentATokenBalance;

const filterDebt = (d: IUserReserveData) => d.currentVariableDebt;

const parseDebt = (d: IUserReserveData): IDebt => ({
    asset: d.symbol,
    assetIcon: (icons as any)[d.symbol] || ethIcon,
    value: (d.currentVariableDebt).toFixed(3) + "",
    interest: (d.variableBorrowRate / 10000000).toFixed(3) + "%"
})

const parseDeposit = (d: IUserReserveData): IDeposit => ({
    asset: d.symbol,
    assetIcon: (icons as any)[d.symbol] || ethIcon,
    value: (d.currentATokenBalance).toFixed(3) + "",
    apy: (d.liquidityRate / 10000000).toFixed(3) + "%"
})

function Dashboard() {
    const [atIndex, setAtIndex] = useState(0);
    const [thrshldValdsnErrMsg, setThrshldValdsnErrMsg] = useState("");
    const [gasValdsnErrMsg, setGasValdsnErrMsg] = useState("");
    const [customThreshold, setCustomThreshold] = useState("1.01");
    const [custmGasLimit, setCustmGasLimit] = useState("100000");
    const [userData, setUserData] = useState<IUserReserveData[]>();
    const [userPosition, setUserPosition] = useState<IUserPosition>();
    const [userAccount, setUserAccount] = useState<IUserAccount>();
    const [isValidUser, setIsValidUser] = useState(false);
    const [displayLoader, setDisplayLoader] = useState(true);
    const [progressVal, setProgressVal] = useState(0);
    const [isMonitoring, setIsMonitoring] = useState(false);

    // contract interaction
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const contract = (new ethers.Contract(subscribers.address, subscribers.abi, signer)) as Subscribers;
    const shark = (new ethers.Contract(lonesomeshark.address, lonesomeshark.abi, signer)) as LoneSomeSharkMonitor;
    const linkToken = (new ethers.Contract(linkAddress, ierc20Artifact.abi, signer)) as IERC20;
    useEffect(() => {
        contract.getUserData()
            .then((data) => {
                console.log("return from get user data:", data)
                const d: IUserReserveData[] = data[0].map((d) => {
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
                        "symbol": d.symbol,
                        "variableBorrowRate": Number(ethers.utils.formatEther(d.variableBorrowRate)),
                        "averageStableBorrowRate": Number(ethers.utils.formatEther(d.averageStableBorrowRate))
                    }
                });
                const userPosition = {
                    currentLiquidationThreshold: Number(
                        ethers.utils.formatEther(data.currentLiquidationThreshold)
                    ),
                    healthFactor: Number(parseFloat(ethers.utils.formatEther(data.healthFactor)).toFixed(5)),
                    availableBorrowsETH: Number(ethers.utils.formatEther(data.availableBorrowsETH)),
                    ltv: Number(ethers.utils.formatEther(data.ltv)),
                    totalCollateralETH: Number(ethers.utils.formatEther(data.totalCollateralETH)),
                    totalDebtETH: parseToNumber(data.totalDebtETH),
                }
                console.log("parsed data is: ", d);
                console.log("user position", userPosition)
                setUserData(d);
                setUserPosition(userPosition);
                setIsValidUser(true);
                setDisplayLoader(false);

            })
            .catch(e => {
                console.log("error getting getUserData")
                console.error(e)
                setDisplayLoader(false);
            });
    }, [userAccount?.collaterals.length])

    useEffect(() => {

        if (isValidUser) {
            const accountInterval = setInterval(() => getLatestUserAccount(), 30 * 1000);
            getLatestUserAccount()
            return function () {
                clearInterval(accountInterval)
            }
        }
    }, [isValidUser])
    useEffect(() => {
        if (isNaN(Number(customThreshold))) {
            // console.log("Not a number. Please enter a number.");
            setThrshldValdsnErrMsg("Not a number. Please enter a number.");
            return;
        }

        const val = Number(customThreshold);

        if (val < 1.01 || val > 1.1) {
            // console.log("Out of acceptable range. Please provide threshold value between 1.01 and 1.1");
            setThrshldValdsnErrMsg("Out of acceptable range. Please provide threshold value between 1.01 and 1.1");
            return;
        }

        console.log("Entered threshold value ", customThreshold);
        setThrshldValdsnErrMsg("");
    }, [customThreshold])
    useEffect(() => {
        if (userAccount?.payback) {
            // const payback = (new ethers.Contract(userAccount?.payback, paybackArtifact.abi, signer)) as PaybackLoan;
            provider.getBalance(userAccount.payback)
                .then((balance) => {
                    console.log("balance of payback contract: ", ethers.utils.formatEther(balance))

                })
                .catch(console.error)
        }

    }, [userAccount?.payback])

    const getLatestUserAccount = (seconds = 0) => {
        console.log("getAccount()")
        setTimeout(() => {
            contract["getAccount()"]()
                .then((account) => {
                    const data = {
                        status: account.status,
                        payback: account.payback == "0x0000000000000000000000000000000000000000" ? "" : account.payback,
                        threshold: parseToNumber(account.threshold),
                        collaterals: account.collaterals
                    }
                    console.log("user account is", { account, data })
                    if (JSON.stringify(userAccount) != JSON.stringify(data)) {
                        setUserAccount(data)
                    }
                    if (data.threshold + "" != customThreshold && data.threshold > 0) {
                        setCustomThreshold(data.threshold + "");
                    }
                    // setDisplayLoader(false);
                })
                .catch(e => {
                    console.log("error getting user account");
                    console.error;
                    setIsValidUser(false);
                    // setDisplayLoader(false);
                })
        }, seconds * 1000);
    }




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
    const debts = userData && userData.length > 0 ? userData?.filter(filterDebt).map(parseDebt) : [
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
    const protectMyAssets = () => {
        console.log("protecting my assets: ");
        const val = formatTreshold(customThreshold);
        console.log({ customThreshold, custmGasLimit });
        setDisplayLoader(true);
        contract.registerHF(val, { value: custmGasLimit })
            .then(
                async (tx) => {
                    console.log("sign up with us transaction: ", tx)
                    await tx.wait();
                    setAtIndex(1);
                    setDisplayLoader(false);
                    getLatestUserAccount();
                }
            )
            .catch(e => {
                console.error;
                setDisplayLoader(false);
            })
    }

    const approveMyCollateral = (_token: string, _symbol: string) => () => {
        setDisplayLoader(true);
        contract
            .approveAsCollateralOnlyIfAllowedInAave(_token)
            .then(async(tx) => {         
                await tx.wait();
                console.log("transaction for allowing token: ", _token, _symbol, tx);
                setDisplayLoader(false);
                getLatestUserAccount(0.3);
                
                
            })
            .catch(e => {
                console.error;
                setDisplayLoader(false);
            })
    }

    
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


    const hasDecimal = (n: number) => {
        return (n - Math.floor(n)) !== 0;
    }

    // need to update
    const handleUpdate = () => {
        console.log("Update Custom Threshold");
        handleFinish();
    }


    const handleFinish = () => {
        //if all conditions met
        if (isNaN(Number(custmGasLimit))) {
            // console.log("Not a number. Please enter a number.");
            setGasValdsnErrMsg("Not a number. Please enter a number.");
            return;
        }

        if (hasDecimal(Number(custmGasLimit))) {
            // console.log("Not a whole number");
            setGasValdsnErrMsg("Not a whole number");
            return;
        }

        if (Number(custmGasLimit) < 100000 || Number(custmGasLimit) > 200000) {
            // console.log("Please provide gas limit 100000 - 200000");
            setGasValdsnErrMsg("Please provide gas limit 100000 - 200000");
            return;
        }

        protectMyAssets()
        setGasValdsnErrMsg("");
    };



    const startMonitoring = async () => {
        setIsMonitoring(true);
        const registryAddress = await shark.getRegistry();
        const id = await shark.getRegistryID();
        if (userAccount?.status != EStatus.ACTIVATED) {
            linkToken
                .approve(registryAddress, ethers.utils.parseEther("1.0"))
                .then(async (tx) => {
                    console.log("transaction from approving link", tx);
                    await tx.wait()
                    setProgressVal(33);
                    const registryContract = (new ethers.Contract(registryAddress, registryArtifact.abi, signer)) as KeeperRegistryBaseInterface
                    registryContract.addFunds(id, ethers.utils.parseEther("1.0"))
                        .then(async (tx) => {
                            console.log("added funds to registry", tx);
                            setProgressVal(66);
                            contract
                                .startMonitoring()
                                .then(async (tx) => {
                                    console.log("monitoring started, ", tx);
                                    await tx.wait()
                                    setProgressVal(100);
                                    setIsMonitoring(false);
                                    getLatestUserAccount()
                                })
                        })
                        .catch(e => {
                            console.error;
                            setIsMonitoring(false);
                        })
                })
                .catch(e => {
                    console.error;
                    setIsMonitoring(false);
                });
        }
    }

    const pauseMonitoring = async () => {
        console.log("pause monitoring");
        contract.pauseMonitoring()
            .then(async (tx) => {
                console.log("tx pause monitoring", tx)
                await tx.wait();
                getLatestUserAccount()
            })
            .catch(console.error)
    }


    const setThreshold = (
        <div className="setThreshold-panel space-y-4">
            <div className="flex justify-between px-10 items-center">
                <div className="space-y-2">
                    <div className="opacity-50 text-lg">Current Health Factor</div>
                    <div className="text-center text-xl">{(userPosition?.healthFactor)?.toFixed(2)}</div>
                </div>
                <div className="lg:pl-20 pl-10">
                    <svg width="52" height="24" viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807611 39.9792 0.807611 39.3934 1.3934C38.8076 1.97919 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z" fill="black" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <div className="opacity-50 text-lg pl-10">Current Liquidation Threshold</div>

                    {/* to be made input */}
                    <div className="text-xl max-w-min ml-10">
                        <input name="threshold " value={customThreshold} onChange={(e) => setCustomThreshold(e.target.value)} className="w-28 bg-secondary" />
                    </div>
                </div>
            </div>
            <p className="text-red text-center">{thrshldValdsnErrMsg}</p>
        </div>);

    const registerWithUsTab = (
        <>
            {setThreshold}
            <div className="px-10 pb-8">
                <div className="pb-2 opacity-50">Set your gas limit for the flash loan contract</div>
                <div className="pb-4 opacity-50 text-xl max-w-min">
                    <input name="gasLimit" value={custmGasLimit} onChange={(e) => setCustmGasLimit(e.target.value)} className="bg-secondary w-28" />
                </div>
                {(userAccount && !userAccount?.payback) ?
                    <div>
                        <div className="flex items-center space-x-4">
                            <div><button className={`inline-block text-white bg-purple px-3 py-2 rounded-md`} onClick={handleUpdate}>Sign Up</button></div>
                            <div className="text-red">{gasValdsnErrMsg}</div>
                        </div>
                    </div> : <div>
                        <div className="flex items-center space-x-4">
                            <div><button className={`inline-block text-white bg-purple px-3 py-2 rounded-md`} onClick={handleFinish}>Update Threshold</button></div>
                            <div className="text-red">{gasValdsnErrMsg}</div>
                        </div>
                    </div>
                }
            </div>
        </>
    );

    const collateralsTab = (<div key={userAccount?.collaterals.length} className="pl-4 space-x-2 space-y-2">
        <div className="pb-2 md:pb-0 opacity-50 text-sm">Select tokens your contract can utilize to pay back the loan and start monitoring your health ❤️</div>
        <div className="hidden md:grid grid-cols-3">
            <div className="col-span-2 border-r-2 border-black border-opacity-25 text-sm">
                <div className="opacity-50">List of tokens available for selection</div>
                <div className="space-x-2 space-y-2 text-xs">
                {userData && userData.length > 0 && userData?.map(token => {
            return <button
                key={token.token + "" + userAccount?.collaterals.length}
                className={` px-1.5 py-1 rounded-md ${userAccount?.collaterals.includes(token.token) ? 'hidden' : 'text-purple border border-purple'}`}
                onClick={approveMyCollateral(token.token, token.symbol)}
                disabled={userAccount?.collaterals.includes(token.token)}>{token.symbol}</button>
        })
        }
                </div>
            </div >
            <div className="pl-4">
                <div className="text-sm opacity-50">Selected Tokens</div>
                <div className="space-x-2 space-y-2 text-xs">
                {userData && userData.length > 0 && userData?.map(token => {
            return <button
                key={token.token + "" + userAccount?.collaterals.length}
                className={` px-1.5 py-1 rounded-md ${userAccount?.collaterals.includes(token.token) ? 'text-green border border-green shadow-md' : 'hidden'}`}
               
                disabled>{token.symbol}</button>
        })
        }
                </div>
            </div>
            <div>

            </div>

        </div>

        {/* <div className="pb-2 opacity-50">Select tokens your contract can utilize to pay back the loan and start monitoring your health ❤️</div> */}
        {userData && userData.length > 0 && userData?.map(token => {
            return <button
                key={token.token + "" + userAccount?.collaterals.length}
                className={` md:hidden px-3 py-2 rounded-md ${userAccount?.collaterals.includes(token.token) ? 'border border-green cursor-default text-green shadow-md' : 'text-purple border border-purple'}`}
                onClick={approveMyCollateral(token.token, token.symbol)}
                disabled={userAccount?.collaterals.includes(token.token)}>{token.symbol}</button>
        })
        }
        {userAccount && userAccount.collaterals.length >= 1 && (
            <div
                className="p-2 m-1"
            >
                <button
                    className={` px-3 py-2 rounded-md text-white bg-purple`}
                    onClick={() => setAtIndex(2)}
                >
                    NEXT
                </button>
            </div>
        )
        }
    </div>);

    const monitoringTab = (
        <div className="pl-4 pb-11">
            <div className="pb-2 opacity-50">Send 1 LINK to the lonesome shark monitoring contract to watch out for your health</div>
            { isMonitoring && <div className="py-4 space-y-4">
            <div className="flex justify-center"><CircularProgress isIndeterminate color="purple.500"/></div>
                <Progress colorScheme="green" size="lg" value={progressVal} hasStripe/>
            </div>}
            {
                (userAccount && userAccount?.status != EStatus.ACTIVATED)
                    ? <button className="text-white bg-purple px-3 py-2 rounded-md"
                        onClick={startMonitoring}>Start Monitoring</button>
                    : <button className="text-white bg-purple px-3 py-2 rounded-md"
                        onClick={pauseMonitoring}>Pause Monitoring</button>

            }

        </div>);

    const dashboard = (
        <div>
            <div className="md:grid grid-cols-3 mt-10 text-left gap-8 space-y-4 md:space-y-0">
                <div className="col-span-1 bg-secondary overflow-hidden rounded-md">

                    <div className="space-y-1 pt-4 pl-4 object-cover pb-4">
                        <div className="text-lg opacity-50 pb-4">Total Aave Deposits in ETH</div>
                        <div className="text-semibold text-5xl">{userPosition?.totalDebtETH || 0} ETH</div>
                        {userAccount && userAccount.status == EStatus.ACTIVATED
                            ? <div className="text-green">are protected</div>
                            : <div className="text-red-type1">are not protected</div>
                        }
                    </div>
                    {userAccount && userAccount.status == EStatus.ACTIVATED && <img src={shield} alt="protect" className="float-right object-none object-bottom relative -mt-8 z-5" />}

                </div>

                <div className="col-span-2">
                    <Tabs variant="enclosed" index={atIndex}>
                        <TabList>
                            <ChakraTab onClick={() => setAtIndex(0)} className="dark:text-white">1. {userAccount && userAccount?.payback ? `Add more gas or update HF Threshold: ${userAccount.threshold}?` : "Register with us"}</ChakraTab>
                            <ChakraTab onClick={() => setAtIndex(1)} isDisabled={userAccount?.payback ? false : true} className="dark:text-white">2. Collaterals ( {userAccount?.collaterals.length} )</ChakraTab>
                            <ChakraTab onClick={() => setAtIndex(2)} isDisabled={userAccount && userAccount?.collaterals.length >= 1 ? false : true} className="dark:text-white">3. Monitoring</ChakraTab>

                        </TabList>
                        <TabPanels className="bg-secondary md:h-56 rounded-b-md">
                            <TabPanel>{registerWithUsTab}</TabPanel>
                            <TabPanel>{collateralsTab}</TabPanel>
                            <TabPanel>{monitoringTab}</TabPanel>
                        </TabPanels>

                    </Tabs>
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
        <div className="dashboard max-w-7xl mx-auto px-6 overflow-hidden">

{ displayLoader && <div className="absolute w-full"><CircularProgress isIndeterminate color="purple.500"/></div> }
            {isValidUser && <Tab.Group
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
            </Tab.Group>}

            {!isValidUser && <div className="text-xl dark:text-white mt-24">No data found for the selected wallet address.</div>}
        </div>
    )
}

export default Dashboard;


function parseToNumber(b: ethers.BigNumber, decimals = 18) {
    const val = ethers.utils.formatUnits(b, decimals);
    const parsedVal = parseFloat(val);
    return Number(parsedVal.toFixed(3));
}

function formatTreshold(t: number | string) {
    return ethers.utils.parseEther(t + "");
}