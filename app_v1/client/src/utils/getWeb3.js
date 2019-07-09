import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // testnet web3
      var HDWalletProvider = require("truffle-hdwallet-provider");
      // var mnemonic = "fabric cruel select earth mushroom hole genuine caution smooth confirm ten pulp";
      var mnemonic = "fiber saddle cable end beyond patrol super cheese toward spoon detect diamond";
      var provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/bb09b43c54444cf3b948ff8af5ebdb74", 0, 100);
      const web3 = new Web3(provider);
  
      resolve(web3);

      // 가나슈 web3
      // const provider = new Web3.providers.HttpProvider(
      //   "http://127.0.0.1:8545"
      // );
      // const web3 = new Web3(provider);
      // resolve(web3);
    });
  });

export default getWeb3;


