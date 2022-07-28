require("@nomicfoundation/hardhat-toolbox");

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
    },
    abiExporter: {
        path: "./src/data/abi",
    },
};
