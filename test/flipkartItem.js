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
            const serialNumber = crypto.randomBytes(16).toString("hex");

            await hardhatToken.createItem(
                serialNumber,
                "https://example.com/test.png",
                ethers.utils.parseEther("0.05"),
                ONE_YEAR,
                false
            );

            expect(await hardhatToken.totalItems()).to.equal(1);

            const item = await hardhatToken.items(serialNumber);
            expect(item.itemId).to.equal(0);
            expect(item.itemURI).to.equal("https://example.com/test.png");
            expect(item.value).to.equal(ethers.utils.parseEther("0.05"));
            expect(item.warrantyPeriod).to.equal(ONE_YEAR);
        });

        it("Should fail if token creator is not the owner", async () => {
            const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);
            await expect(
                hardhatToken
                    .connect(addr1)
                    .createItem(
                        crypto.randomBytes(16).toString("hex"),
                        "https://example.com/test.png",
                        ethers.utils.parseEther("0.05"),
                        ONE_YEAR,
                        false
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    const createItemFixture = async () => {
        const deployTokenData = await loadFixture(deployTokenFixture);

        const sNo1 = crypto.randomBytes(16).toString("hex");
        const sNo2 = crypto.randomBytes(16).toString("hex");

        await deployTokenData.hardhatToken.createItem(
            sNo1,
            "https://example.com/test1.png",
            ethers.utils.parseEther("0.01"),
            ONE_YEAR,
            false
        );

        await deployTokenData.hardhatToken.createItem(
            sNo2,
            "https://example.com/test2.png",
            ethers.utils.parseEther("0.02"),
            ONE_YEAR,
            true
        );

        return { ...deployTokenData, sNo1, sNo2 };
    };

    describe("Minting", () => {
        it("Should mint an item to the creator", async () => {
            const { hardhatToken, addr1, sNo1 } = await loadFixture(createItemFixture);

            const txnInfo = await hardhatToken.connect(addr1).buyItem(sNo1, { value: ethers.utils.parseEther("0.01") });
            const block = await ethers.provider.getBlock(txnInfo.blockNumber);

            const item = await hardhatToken.items(sNo1);
            expect(await hardhatToken.ownerOf(item.itemId)).to.equal(addr1.address);
            expect(item.creationTime).to.equal(block.timestamp);
            expect(item.isPurchased).to.equal(true);
            expect(await ethers.provider.getBalance(hardhatToken.address)).to.equal(ethers.utils.parseEther("0.01"));
        });

        it("Should fail if item does not exist", async () => {
            const { hardhatToken, addr1 } = await loadFixture(createItemFixture);
            await expect(
                hardhatToken
                    .connect(addr1)
                    .buyItem(crypto.randomBytes(16).toString("hex"), { value: ethers.utils.parseEther("0.01") })
            ).to.be.revertedWith("Item does not exist!");
        });

        it("Should fail if item is already bought", async () => {
            const { hardhatToken, addr1, addr2, sNo1 } = await loadFixture(createItemFixture);
            4;
            await hardhatToken.connect(addr1).buyItem(sNo1, { value: ethers.utils.parseEther("0.01") });
            await expect(
                hardhatToken.connect(addr2).buyItem(sNo1, { value: ethers.utils.parseEther("0.01") })
            ).to.be.revertedWith("Item is not for sale!");
        });

        it("Should fail if incorrect amount of ether is sent", async () => {
            const { hardhatToken, addr1, sNo1 } = await loadFixture(createItemFixture);
            await expect(hardhatToken.connect(addr1).buyItem(sNo1, { value: 0 })).to.be.revertedWith(
                "Incorrect amount of ether sent!"
            );
        });
    });

    const buyItemFixture = async () => {
        const createItemData = await loadFixture(createItemFixture);

        await createItemData.hardhatToken
            .connect(createItemData.addr1)
            .buyItem(createItemData.sNo1, { value: ethers.utils.parseEther("0.01") });
        await createItemData.hardhatToken
            .connect(createItemData.addr2)
            .buyItem(createItemData.sNo2, { value: ethers.utils.parseEther("0.02") });

        return createItemData;
    };

    describe("Resale", () => {
        it("Should transfer an item to another address", async () => {
            const { hardhatToken, addr1, addr2, sNo1 } = await loadFixture(buyItemFixture);

            await hardhatToken.connect(addr1).setValue(sNo1, ethers.utils.parseEther("0.015"));
            await hardhatToken.connect(addr1).putForResale(sNo1);
            await hardhatToken.connect(addr2).buyResaleItem(sNo1, { value: ethers.utils.parseEther("0.015") });

            expect(await hardhatToken.ownerOf(0)).to.equal(addr2.address);
            expect((await hardhatToken.items(sNo1)).availableForResale).to.equal(false);
        });

        it("Should fail if setValue is called by another address", async () => {
            const { hardhatToken, addr2, sNo1 } = await loadFixture(buyItemFixture);
            await expect(
                hardhatToken.connect(addr2).setValue(sNo1, ethers.utils.parseEther("0.015"))
            ).to.be.revertedWith("Unauthorized to set value!");
        });

        it("Should fail if putForResale is called by another address", async () => {
            const { hardhatToken, addr2, sNo1 } = await loadFixture(buyItemFixture);
            await expect(hardhatToken.connect(addr2).putForResale(sNo1)).to.be.revertedWith(
                "Unauthorized to resell item!"
            );
        });

        it("Should fail if item is soulbound", async () => {
            const { hardhatToken, addr2, sNo2 } = await loadFixture(buyItemFixture);
            await expect(hardhatToken.connect(addr2).putForResale(sNo2)).to.be.revertedWith(
                "Cannot resell, item is soulbound!"
            );
        });
    });

    describe("Warranty", () => {
        it("Should create a warranty on a product", async () => {
            const { hardhatToken, addr1, addr2, sNo1 } = await loadFixture(buyItemFixture);

            await hardhatToken.addWarranty(sNo1, WarrantyReason.WEAR_AND_TEAR, WarrantyOutcome.REPAIR);
            await hardhatToken.addWarranty(sNo1, WarrantyReason.THEFT, WarrantyOutcome.REPLACE);

            expect(await hardhatToken.getItemWarrantyLength(sNo1)).to.equal(2);

            // TODO : implement this properly
            expect(Object.values(await hardhatToken.getItemWarranty(sNo1, 0))[0]).to.equal(0);
            expect(Object.values(await hardhatToken.getItemWarranty(sNo1, 1))[1]).to.equal(1);
        });

        it("Should fail if warranty has expired", async () => {
            const { hardhatToken, sNo1 } = await loadFixture(buyItemFixture);

            await network.provider.send("evm_increaseTime", [ONE_YEAR + 1]);
            await expect(
                hardhatToken.addWarranty(sNo1, WarrantyReason.WEAR_AND_TEAR, WarrantyOutcome.REPAIR)
            ).to.be.revertedWith("Warranty has expired!");
        });
    });
});
