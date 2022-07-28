const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const main = async () => {
    // console.log(network);
    const Token = await ethers.getContractFactory("FlipkartItem");
    const [owner] = await ethers.getSigners();
    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    console.log(`Token deployed at ${hardhatToken.address} on network ${network.name}`);

    fs.writeFileSync(
        path.join(__dirname, "../src/data", `${network.name}.json`),
        JSON.stringify(
            {
                owner: owner.address,
                address: hardhatToken.address,
            },
            null,
            4
        )
    );

    fs.copyFileSync(
        path.join(__dirname, "../artifacts/contracts/FlipkartItem.sol/FlipkartItem.json"),
        path.join(__dirname, "../src/data/FlipkartItem.json")
    );
};

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
