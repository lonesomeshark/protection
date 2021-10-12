
import React, {useState, useEffect} from "react";
import fs from 'fs';
import path from 'path';
const Assets = ()=>{

    const [icons, setIcons]= useState<{[tokenName: string]: string}>({})
    // const images = require.context("../app/assets", true);
    useEffect(() => {
        // images("1INCH"+".svg")
        // require()
    },[])

    return {
        icons
    }
}

export default Assets;