import React from "react";
import bg from "../../assets/bg.png";
import star from "../../assets/star.png";
import wallet from "../../assets/wallet.png";
import shield from "../../assets/shield-full.png";
import { Link } from "react-router-dom";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";

type Props = {
    connected: boolean,
}

function Home({ connected }: Props) {

    return (
        <div className="md:px-40 lg:px-72 space-y-8 md:mt-10 dark:bg-black-type1">
            { !connected && <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Wallet not connected!</AlertTitle>
                <AlertDescription>Please connect wallet to continue</AlertDescription>
            </Alert> }
            <div className="rounded-md items-center space-y-10 pb-14 pt-28 lg:px-52"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}>
                <div className="text-4xl text-white px-4">
                    Helping borrowers protect their collateral from liquidation
                </div>
                <div className="flex justify-center space-x-4">
                    <button className="text-purple bg-white rounded-md px-3 py-2 font-semibold"><Link to={`${connected ? "/dashboard" : "/"}`}>Launch App</Link></button>
                    {/* <button className="text-purple border border-purple rounded-md px-3 py-2">How does it work?</button> */}
                </div>
            </div>
            <div className="flex justify-center space-x-4">
                <div><img src={star} alt="" /></div>
                <div className="dark:text-white">Protect your assets in 3 simple steps</div>
                <div><img src={star} alt="" /></div>
            </div>
            <div className="md:flex justify-between space-y-8 md:space-y-0 md:space-x-4 font-semibold text-gray-type1">
                <div className="bg-secondary rounded-md space-y-10 pt-6 pb-12 min-w-20 px-16 max-w-sm mx-auto md:mx-0">
                    <div className="">Step 1:</div>
                    <div className="flex justify-center"><img src={wallet} alt="" /></div>
                    <div className="">Connect your wallet and<br/> go to dashboard</div>
                </div>
                <div className="bg-secondary rounded-md space-y-10 pt-6 pb-12 min-w-20 px-12 max-w-sm mx-auto md:mx-0">
                    <div className="">Step 2:</div>
                    <div className=" text-5xl max-w-min text-center mx-auto border-l-4 border-purple">1.01</div>
                    <div className="pt-2 ">Set custom Health Factor <br/>threshold & gas limit and<br/> &quot;<i>Sign up</i>&quot; to the service</div>
                </div>
                <div className="bg-secondary rounded-md space-y-6 pt-6 pb-12 min-w-20 px-8 max-w-sm mx-auto md:mx-0">
                    <div className="">Step 3:</div>
                    <div className="flex justify-center"><img src={shield} alt="" className="scale-50" /></div>
                    <div className="">Select tokens to be collaterized and <br/>&quot;<i>Start monitoring</i>&quot;, to<br/> protect your assets.</div>
                </div>
            </div>

        </div>
    )
}

export default Home;