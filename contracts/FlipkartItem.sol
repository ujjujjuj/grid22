//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TODO : add reenrtrant guard

contract FlipkartItem is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    struct Item {
        uint itemId;
        string itemURI;
        uint value;
        uint warrantyPeriod;
        bool isSoulbound;
    }

    struct ItemInfo {
        uint itemId;
        uint creationTime;
        address[] ownerHistory;
        bool availableForResale;
        uint resaleValue;
    }

    enum WarrantyReason {
        WEAR_AND_TEAR,
        THEFT,
        WATER_DAMAGE
    }

    enum WarrantyOutcome {
        REPAIR,
        REPLACE
    }

    struct WarrantyInfo {
        WarrantyReason reason;
        WarrantyOutcome outcome;
        uint timestamp;
    }

    mapping(uint => WarrantyInfo[]) public warrantyInfos;
    Item[] public items;
    mapping(uint => ItemInfo) public purchasedItems;
    uint[] public serialNumbers;
    mapping(address => uint) public plusCoins;

    constructor() ERC721("FlipItem", "FLIP") {}

    function createItem(
        string memory itemURI,
        uint value,
        uint warrantyPeriod,
        bool isSoulbound
    ) public onlyOwner {
        items.push(
            Item(
                _itemIds.current(),
                itemURI,
                value,
                warrantyPeriod,
                isSoulbound
            )
        );
        _itemIds.increment();
    }

    function buyItem(
        uint itemId,
        uint serialNumber,
        uint tokens
    ) public payable {
        require(itemId < items.length, "Item does not exist!");
        require(!itemExists(serialNumber), "Serial number exists!");
        require(
            msg.value + tokens * 1000 gwei == items[itemId].value,
            "Incorrect amount of ether sent!"
        );
        require(
            tokens <= plusCoins[msg.sender],
            "User does not have enough tokens!"
        );

        ItemInfo memory itemInfo;
        itemInfo.itemId = itemId;
        itemInfo.creationTime = block.timestamp;
        itemInfo.availableForResale = false;
        itemInfo.resaleValue = items[itemId].value;
        purchasedItems[serialNumber] = itemInfo;
        purchasedItems[serialNumber].ownerHistory.push(msg.sender);
        serialNumbers.push(serialNumber);

        _mint(msg.sender, serialNumber);
        plusCoins[msg.sender] -= tokens;
        plusCoins[msg.sender] += msg.value / 1e12;
    }

    function totalItems() public view returns (uint) {
        return _itemIds.current();
    }
    function putForResale(uint serialNumber, uint resaleValue) public {
        require(itemExists(serialNumber), "Item does not exist!");
        require(
            msg.sender == getLastOwner(serialNumber),
            "Unauthorized to resell item!"
        );
        require(
            !items[purchasedItems[serialNumber].itemId].isSoulbound,
            "Cannot resell, item is soulbound!"
        );

        purchasedItems[serialNumber].availableForResale = true;
        purchasedItems[serialNumber].resaleValue = resaleValue;
    }

    function buyResaleItem(uint serialNumber) public payable {
        require(itemExists(serialNumber), "Item does not exist!");
        require(
            purchasedItems[serialNumber].availableForResale,
            "Item not available for resale!"
        );
        require(
            purchasedItems[serialNumber].resaleValue == msg.value,
            "Incorrect amount of ether sent!"
        );

        address lastOwner = getLastOwner(serialNumber);
        payable(lastOwner).transfer(msg.value);
        _transfer(lastOwner, msg.sender, serialNumber);

        purchasedItems[serialNumber].availableForResale = false;
        purchasedItems[serialNumber].ownerHistory.push(msg.sender);
    }

    function addWarranty(
        uint serialNumber,
        uint warrantyReason,
        uint warrantyOutcome
    ) public onlyOwner {
        require(isWarrantyExpired(serialNumber), "Warranty has expired!");
        warrantyInfos[serialNumber].push(
            WarrantyInfo(
                WarrantyReason(warrantyReason),
                WarrantyOutcome(warrantyOutcome),
                block.timestamp
            )
        );
    }

    function itemExists(uint serialNumber)
        private
        view
        returns (bool)
    {
        bool exists;
        for (uint i = 0; i < serialNumbers.length; i++) {
            if (serialNumbers[i] == serialNumber) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    function getLastOwner(uint serialNumber)
        private
        view
        returns (address)
    {
        return
            purchasedItems[serialNumber].ownerHistory[
                purchasedItems[serialNumber].ownerHistory.length - 1
            ];
    }

    function getSerialNumbersLength() public view returns (uint) {
        return serialNumbers.length;
    }

    function getItemOwners(uint serialNumber)
        public
        view
        returns (address[] memory)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return purchasedItems[serialNumber].ownerHistory;
    }

    function getItemWarranty(uint serialNumber)
        public
        view
        returns (WarrantyInfo[] memory)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return warrantyInfos[serialNumber];
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function isWarrantyExpired(uint serialNumber)
        public
        view
        returns (bool)
    {
        return
            purchasedItems[serialNumber].creationTime +
                items[purchasedItems[serialNumber].itemId].warrantyPeriod >
            block.timestamp;
    }

    function getAllItems() public view returns (Item[] memory) {
        return items;
    }

    function getResaleItems() public view returns (ItemInfo[] memory) {
        ItemInfo[] memory itemInfos;
        uint ctr = 0;
        for (uint i = 0; i < serialNumbers.length; i++) {
            if (
                purchasedItems[serialNumbers[i]].availableForResale &&
                !items[purchasedItems[serialNumbers[i]].itemId].isSoulbound
            ) {
                itemInfos[ctr] = (purchasedItems[serialNumbers[i]]);
                ctr++;
            }
        }

        return itemInfos;
    }
}
