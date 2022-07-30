require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.9",
    gasReporter: {
        // enabled: true,
    },
    networks: {
        ganache: {
            url: "http://localhost:7545",
        },
        localhost: {
            url: "http://localhost:8545",
        },
        hardhat: {
            chainId: 1337,
        },
        polygontest: {
            url: `https://rpc-mumbai.maticvigil.com`,
            accounts: [process.env.WALLET_PRIVATE_KEY],
        },
    },
    abiExporter: {
        path: "./src/data/abi",
    },
};
