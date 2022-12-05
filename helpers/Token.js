const Web3   =  require("web3");
const web3    = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org:443"));
const Wallet  = require("./Wallet");
const Binance = require("./Binance");
const mini_abi = require("../abi/mini_abi");
const pcs_abi = require("../abi/IUniswapV2Router02.json");

class Token {

    contract;
    pairAddress;

    constructor(contract, pairAddress) {
        this.contract    = contract;
        this.pairAddress = pairAddress;
    }

    async getSupply() {
        let contract = new web3.eth.Contract(mini_abi, this.contract);
        let supply   = await contract.methods.totalSupply().call();
        let decimals = await contract.methods.decimals().call();
        return parseInt(supply) / 10 ** decimals;
    }

    async getPrice() {

        let contract = new web3.eth.Contract(mini_abi, this.contract);

        let decimals = await contract.methods.decimals().call();

        let Routercontract = new web3.eth.Contract(pcs_abi.abi, "0x10ED43C718714eb63d5aA57B78B54704E256024E");
         let tokenpriceInUSD;
        try {
            let price =  await Routercontract.methods.getAmountsOut(
            `${1 * Math.pow(10, decimals)}`,
                [this.contract, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', '0xe9e7cea3dedca5984780bafc599bd69add087d56']
            
            ).call();

            let priceInUsd = Number(price[2]);
                priceInUsd = parseFloat( priceInUsd / Math.pow(10, 18));
                tokenpriceInUSD = parseFloat(priceInUsd).toFixed(12);
            
        } catch (error) {
                tokenpriceInUSD = parseFloat(0).toFixed(10);
        }

        return tokenpriceInUSD;

       /* let wbnb_addr  = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

        let bnb_price = await Binance.getBnbPrice();
        let wallet1   = new Wallet(wbnb_addr, this.pairAddress);
        let wallet2   = new Wallet(this.contract, this.pairAddress);

        let pool_wbnb  = await wallet1.getBalance();
        let pool_token = await wallet2.getBalance();
        let pool_price = pool_wbnb / pool_token * bnb_price;
        */
        //return parseFloat(10);
    }

    async getPoolInfo() {
        let wbnb_addr = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

        let bnb_price = await Binance.getBnbPrice();
        let wallet1   = new Wallet(wbnb_addr, this.pairAddress);
        let wallet2   = new Wallet(this.contract, this.pairAddress);

        let pool_wbnb  = await wallet1.getBalance();
        let pool_token = await wallet2.getBalance();

        let pool_price = pool_wbnb / pool_token * bnb_price;

        return {
            bnb: (pool_wbnb * bnb_price),
            tokens: (pool_price * pool_token),
            value: (pool_wbnb * bnb_price) + (pool_price * pool_token)
        };
    }

    setContract(contract) {
        this.contract = contract;
    }

    setPairAddress(pairAddress) {
        this.pairAddress = pairAddress;
    }

    getContract() {
        return this.contract;
    }

    getPairAddress() {
        return this.pairAddress;
    }

}

module.exports = Token;