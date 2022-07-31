const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

const ONE_YEAR = 60 * 60 * 24 * 365;

const WarrantyReason = {
    WEAR_AND_TEAR: 0,
    THEFT: 1,
};

const WarrantyOutcome = {
    REPAIR: 0,
    REPLACE: 1,
};

const products = [
    {
        serialNumber: Math.floor(Math.random() * 42424242),
        uri: "https://example.com/test1.png",
        value: ethers.utils.parseEther("0.01"),
        warranty: ONE_YEAR,
        isSoulbound: false,
    },
    {
        serialNumber: Math.floor(Math.random() * 42424242),
        uri: "https://example.com/test2.png",
        value: ethers.utils.parseEther("0.02"),
        warranty: ONE_YEAR,
        isSoulbound: true,
    },
];

describe("Flipkart Item", () => {
    const deployTokenFixture = async () => {
        const Token = await ethers.getContractFactory("FlipkartItem");
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatToken = await Token.deploy();

        await hardhatToken.deployed();

        return { Token, hardhatToken, owner, addr1, addr2 };
    };

    describe("Creation", () => {
        it("Should create a new item", async () => {
            const { hardhatToken } = await loadFixture(deployTokenFixture);
            await hardhatToken.createItem(
                products[0].uri,
                products[0].value,
                products[0].warranty,
                products[0].isSoulbound
            );

            expect(await hardhatToken.totalItems()).to.equal(1);

            const item = await hardhatToken.items(0);
            expect(item.itemId).to.equal(0);
            expect(item.itemURI).to.equal(products[0].uri);
            expect(item.value).to.equal(products[0].value);
            expect(item.warrantyPeriod).to.equal(products[0].warranty);
        });

        it("Should fail if token creator is not the owner", async () => {
            const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);
            await expect(
                hardhatToken
                    .connect(addr1)
                    .createItem(products[0].uri, products[0].value, products[0].warranty, products[0].isSoulbound)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    const createItemFixture = async () => {
        const deployTokenData = await loadFixture(deployTokenFixture);

        await deployTokenData.hardhatToken.createItem(
            products[0].uri,
            products[0].value,
            products[0].warranty,
            products[0].isSoulbound
        );

        await deployTokenData.hardhatToken.createItem(
            products[1].uri,
            products[1].value,
            products[1].warranty,
            products[1].isSoulbound
        );

        return deployTokenData;
    };

    describe("Minting", () => {
        it("Should mint an item", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);

            const txnInfo = await hardhatToken.connect(addr1).buyItem(0, products[0].serialNumber, 0, {
                value: products[0].value,
            });
            const block = await ethers.provider.getBlock(txnInfo.blockNumber);

            const item = await hardhatToken.purchasedItems(products[0].serialNumber);
            expect(await hardhatToken.ownerOf(products[0].serialNumber)).to.equal(addr1.address);
            expect(item.creationTime).to.equal(block.timestamp);
            expect(await ethers.provider.getBalance(hardhatToken.address)).to.equal(products[0].value);
            expect(await hardhatToken.plusCoins(addr1.address)).to.equal(products[0].value / 1e12);
        });

        it("Should be able to buy items using game tokens", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);

            await hardhatToken.connect(addr1).buyItem(0, products[0].serialNumber, 0, {
                value: products[0].value,
            });

            await hardhatToken.connect(addr1).buyItem(1, products[1].serialNumber, 1e4, {
                value: products[0].value,
            });
        });

        it("Should fail if item does not exist", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);
            await expect(
                hardhatToken.connect(addr1).buyItem(42, "42", 0, { value: products[0].value })
            ).to.be.revertedWith("Item does not exist!");
        });

        it("Should fail if serial number exists", async () => {
            const { hardhatToken, addr1, addr2 } = await loadFixture(createItemFixture);

            await hardhatToken.connect(addr1).buyItem(0, products[0].serialNumber, 0, {
                value: products[0].value,
            });

            await expect(
                hardhatToken.connect(addr2).buyItem(0, products[0].serialNumber, 0, {
                    value: products[0].value,
                })
            ).to.be.revertedWith("Serial number exists!");
        });

        it("Should fail if incorrect amount of ether is sent", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);
            await expect(
                hardhatToken.connect(addr1).buyItem(0, products[0].serialNumber, 0, { value: 0 })
            ).to.be.revertedWith("Incorrect amount of ether sent!");
        });

        it("Should fail if user does not have enough tokens", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);
            await expect(hardhatToken.connect(addr1).buyItem(0, products[0].serialNumber, 10000)).to.be.revertedWith(
                "User does not have enough tokens!"
            );
        });
    });

    const buyItemFixture = async () => {
        const createItemData = await loadFixture(createItemFixture);

        await createItemData.hardhatToken
            .connect(createItemData.addr1)
            .buyItem(0, products[0].serialNumber, 0, { value: products[0].value });
        await createItemData.hardhatToken
            .connect(createItemData.addr2)
            .buyItem(1, products[1].serialNumber, 0, { value: products[1].value });

        return createItemData;
    };

    describe("Resale", () => {
        it("Should transfer an item to another address", async () => {
            const { hardhatToken, addr1, addr2 } = await loadFixture(buyItemFixture);

            await hardhatToken.connect(addr1).putForResale(products[0].serialNumber, ethers.utils.parseEther("0.015"));
            await hardhatToken
                .connect(addr2)
                .buyResaleItem(products[0].serialNumber, { value: ethers.utils.parseEther("0.015") });

            expect(await hardhatToken.ownerOf(products[0].serialNumber)).to.equal(addr2.address);
            expect((await hardhatToken.purchasedItems(products[0].serialNumber)).availableForResale).to.equal(false);
        });

        it("Should fail if putForResale is called by another address", async () => {
            const { hardhatToken, addr2 } = await loadFixture(buyItemFixture);
            await expect(
                hardhatToken.connect(addr2).putForResale(products[0].serialNumber, ethers.utils.parseEther("0.015"))
            ).to.be.revertedWith("Unauthorized to resell item!");
        });

        it("Should fail if item is soulbound", async () => {
            const { hardhatToken, addr2 } = await loadFixture(buyItemFixture);
            await expect(
                hardhatToken.connect(addr2).putForResale(products[1].serialNumber, ethers.utils.parseEther("0.015"))
            ).to.be.revertedWith("Cannot resell, item is soulbound!");
        });
    });

    describe("Warranty", () => {
        it("Should create a warranty on a product", async () => {
            const { hardhatToken } = await loadFixture(buyItemFixture);

            const txnInfo = await hardhatToken.addWarranty(
                products[0].serialNumber,
                WarrantyReason.WEAR_AND_TEAR,
                WarrantyOutcome.REPAIR
            );
            const block = await ethers.provider.getBlock(txnInfo.blockNumber);
            await hardhatToken.addWarranty(products[0].serialNumber, WarrantyReason.THEFT, WarrantyOutcome.REPLACE);    

            const warranties = await hardhatToken.getItemWarranty(products[0].serialNumber);
            console.log(Object.values(warranties[1])[2] - block.timestamp);

            // TODO : implement this properly using enums
            expect(Object.values(warranties[0])[0]).to.equal(0);
            expect(Object.values(warranties[1])[1]).to.equal(1);
        });

        it("Should fail if warranty has expired", async () => {
            const { hardhatToken } = await loadFixture(buyItemFixture);

            await ethers.provider.send("evm_increaseTime", [ONE_YEAR + 1]);
            await expect(
                hardhatToken.addWarranty(products[0].serialNumber, WarrantyReason.WEAR_AND_TEAR, WarrantyOutcome.REPAIR)
            ).to.be.revertedWith("Warranty has expired!");
        });
    });
});
