import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="px-96 space-y-8 mt-10">
            <div className="text-5xl">Protect your Aave collateral
                against Impermanent losses
                and shadowy liquidators</div>
            <div className="flex justify-center space-x-4">
                <button className="text-white bg-purple rounded-md px-3 py-2"><Link to={"/dashboard"}>Launch App</Link></button>
                <button className="text-purple border border-purple rounded-md px-3 py-2">How does it work?</button>
            </div>
        </div>
    )
}

export default Home;