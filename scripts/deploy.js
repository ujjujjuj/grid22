const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const main = async () => {
    const [owner, addr1] = await ethers.getSigners();

    console.log("Deploying contract on network", network.name);
    console.log("Account:", owner.address);
    console.log("Account balance:", ethers.utils.formatEther(await owner.getBalance()), "ETH");

    const Token = await ethers.getContractFactory("FlipkartItem");
    const hardhatToken = await Token.deploy();
    process.stdout.write("Waiting for contract to get deployed...");
    await hardhatToken.deployed();
    process.stdout.write(" done\n");

    console.log(`Contract address: ${hardhatToken.address}`);

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
