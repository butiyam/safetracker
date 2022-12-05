import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import Wallet from '../helpers/Wallet';
import api from "../services/api";

const mini_abi = require("../abi/mini_abi");
const pcs_abi = require("../abi/IUniswapV2Router02.json");

const Web3  = require("web3");
const web3  = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org:443"));
const TrackerContext = createContext();

const tokenList = require("../tokens");

export function TrackerProvider({ children }) {

    const [ active, setActive ]   = useState(null);
    const [ tokens, setTokens ]   = useState(null);
    const [ pairId, setPairId ]   = useState(0);
    const [ error, setError ]     = useState(null);
    const [ txnData, setTxnData ] = useState(null);
    const [ time, setTime ]       = useState("h24");
    const [ loading, setLoading ] = useState(true);
    const [ price, setPrice ]     = useState(0);
    const [ burned, setBurned ]   = useState(0);
    const [ supply, setSupply ]   = useState(0);
    const [ circulating, setCirculating ] = useState(0);

    useEffect(() => {
        updateTokenList();
    }, []);

    useEffect(() => {
        if (!active) {
            return;
        }

        updateTxnData();
        updateSupplyStats();
    }, [active]);

    const refreshData = async() => {
        await updateTokenList();
    }

    const updateTokenList = async() => {
        let list      = [];
        let tokenData = tokenList;

        for (let i = 0; i < tokenData.length; i++) {
            list.push(tokenData[i].contract);
        }

        let pairs = await api.get("tokens/"+list.join(","))
            .then(res => res.data.pairs);
            
        let filtered = [];

        for (let i = 0; i < tokenData.length; i++) {
            let token   = tokenData[i];
            token.key   = i;
            token.pairs = [];
            token.price = [];

            let contract = new web3.eth.Contract(mini_abi, token.contract);

            let decimals = await contract.methods.decimals().call();
    
            let Routercontract = new web3.eth.Contract(pcs_abi.abi, "0x10ED43C718714eb63d5aA57B78B54704E256024E");
             let tokenpriceInUSD;
            try {
                let price =  await Routercontract.methods.getAmountsOut(
                `${1 * Math.pow(10, decimals)}`,
                    [token.contract, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', '0xe9e7cea3dedca5984780bafc599bd69add087d56']
                
                ).call();
    
                let priceInUsd = Number(price[2]);
                    priceInUsd = parseFloat( priceInUsd / Math.pow(10, 18));
                    tokenpriceInUSD = parseFloat(priceInUsd).toFixed(12);
                
            } catch (error) {
                    tokenpriceInUSD = parseFloat(0).toFixed(10);
            }
            token.price.push(tokenpriceInUSD);
            for (let p = 0; p < pairs.length; p++) {
                if (pairs[p].baseToken.address.toLowerCase() === tokenData[i].contract.toLowerCase()) {
                   token.pairs.push(pairs[p]);
                 
                }
            }

            filtered.push(token);
        }

            // loop through each token
            for (let i = 0; i < filtered.length; i++) {
                let token = filtered[i];
    
                // if there's no pairs, then we skip.
                if (!token.pairs || token.pairs.length === 0) {
                    continue;
                }
    
                filtered[i].bestPair = token.pairs[0];
    
                // then loop trough each pair of the token to get the best price.
                for (let p = 0; p < token.pairs.length; p++) {
                    let pair = token.pairs[p];
    
                    if (pair.priceUsd > filtered[i].bestPair.priceUsd) {
                        filtered[i].bestPair = pair;
                    }
                }
            }

        setTokens(filtered);
        console.log("Updated")

        if (!active)
            setActive(filtered[0]);
    }

    const getTimeName = () => {
        if (time === "h24")
            return "24 Hrs";
        if (time === "h6")
            return "6 Hrs";
        if (time === "h1")
            return "1 Hr";
        if (time === "m5")
            return "5 Mins";
        return "";
    }

    const changeTime = (key) => {
        setTime(key.currentKey)
    }

    const updateTxnData = async() => {
        setTxnData(null);
        let res = await axios.get("/api/token/txns/"+active.contract).then(res => res.data);
        setTxnData(res);
    }

    const updateSupplyStats = async() => {
        setSupply(null);
        setBurned(null);
        setCirculating(null);

        let supply = await getSupply();
        let burned = await getBurned();
        let circulating = supply - burned;

        setSupply(supply);
        setBurned(burned);
        setCirculating(circulating);
    }

    const getSupply = async() => {
        let mini_abi = require("../abi/mini_abi");
        let contract = new web3.eth.Contract(mini_abi, active.contract);
        let supply   = await contract.methods.totalSupply().call();
        let decimals = await contract.methods.decimals().call();
        return parseInt(supply) / 10 ** decimals;
    }

    const getBurned = async() => {
        if (!active.canBurn) {
            return 0;
        }

        let wallet = new Wallet(active.contract, active.burn_wallet);
        return wallet.getBalance();
    }

    return (
        <TrackerContext.Provider
            value={{
                tokens, setTokens, active, setActive, txnData, setTxnData, time, setTime,
                loading, pairId, setPairId, supply, circulating, burned, tokenList,
                getTimeName, changeTime, refreshData, price, setPrice
            }}>
            {children}
        </TrackerContext.Provider>
    );

}

export const useTracker = () => useContext(TrackerContext);