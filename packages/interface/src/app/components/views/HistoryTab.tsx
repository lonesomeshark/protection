import axios from "axios";
import React, { useEffect } from "react";

type Props = {
    paybackAddress: string,
}

function HistoryTab({ paybackAddress } : Props) {

    useEffect(() => {
    //    try {
    //         axios.get(`https://api-kovan.etherscan.io/api?module=account&action=txlist&address=${paybackAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=NUGYAK1GPKXZ1SATMS9XQYBA7N4NMV7FNH`).then(res => {
    //             console.log(res);
    //         }).catch(console.error)
    //    } catch(e) {
    //        console.log("ERROR")
    //    }
    // console.log()
    }, []);


    const mockhistory = [
        {
            timestamp: "10.10.2021 06:30",
            liquidated: ["ETH","DAI","YFI"],
            fees: "0.15 ETH",
            collateral: "$ 12,200.67",
            transactionHash: "0xc1234wdsdcsasu5tgjhjghsd"
        },
        {
            timestamp: "10.11.2021 06:30",
            liquidated: ["UNI","BAT"],
            fees: "0.05 ETH",
            collateral: "$ 5000.37",
            transactionHash: "0xcbcbcbvcbcsas1233dasdasd"
        }
    ];

    const historyView = mockhistory ? mockhistory.map((item, index) => {
        return (
            <div key={index} className="grid grid-cols-5 py-3 pl-4 border border-gray border-opacity-50 border-t-0 dark:text-white dark:bg-black-type1">
                <div className="text-left flex space-x-2">{item.timestamp}</div>
                <div className="text-left pl-0 sm:pl-8 lg:pl-0 space-x-2">{item.liquidated.map((asset, index) => {
                        return (
                            <button key={index} className="border border-purple px-2 py-1 rounded-md">
                                {asset}
                            </button>
                        )
                })}</div>
                <div className="lg:text-left sm:pl-10">{item.fees}</div>
                <div className="text-left pl-4">{item.collateral}</div>
                <div className="lg:text-left">{item.transactionHash}</div>
            </div>
        )
    }) : null;

    const history = (<div className="pt-4 min-w-max">
        <div className="flex justify-between space-x-24 bg-secondary pl-4 pr-16 py-2 border border-gray border-opacity-50 rounded-t-md font-semibold">
            <div>Time stamp</div>
            <div>Assets transferred</div>
            <div>Transaction fees</div>
            <div>Collateral sent (ETH)</div>
            <div>Transaction hash</div>
        </div>
        {historyView}
    </div>);

    return (<div>{history}</div>)
}

export default HistoryTab;