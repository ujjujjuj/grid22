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
        THEFT
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

    mapping(string => WarrantyInfo[]) public warrantyInfos;
    Item[] public items;
    mapping(string => ItemInfo) public purchasedItems;
    string[] public serialNumbers;

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

    function buyItem(uint itemId, string memory serialNumber) public payable {
        require(itemId < items.length, "Item does not exist!");
        require(!itemExists(serialNumber), "Serial number exists!");
        require(
            msg.value == items[itemId].value,
            "Incorrect amount of ether sent!"
        );

        ItemInfo memory itemInfo;
        itemInfo.itemId = itemId;
        itemInfo.creationTime = block.timestamp;
        itemInfo.availableForResale = false;
        itemInfo.resaleValue = items[itemId].value;
        purchasedItems[serialNumber] = itemInfo;
        purchasedItems[serialNumber].ownerHistory.push(msg.sender);
        serialNumbers.push(serialNumber);

        _mint(msg.sender, hashString(serialNumber));
    }

    function totalItems() public view returns (uint) {
        return _itemIds.current();
    }

    function setResaleValue(string memory serialNumber, uint value) public {
        require(itemExists(serialNumber), "Item does not exist!");
        require(
            msg.sender == getLastOwner(serialNumber),
            "Unauthorized to set value!"
        );

        purchasedItems[serialNumber].resaleValue = value;
    }

    function putForResale(string memory serialNumber) public {
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
    }

    function buyResaleItem(string memory serialNumber) public payable {
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
        _transfer(lastOwner, msg.sender, hashString(serialNumber));

        purchasedItems[serialNumber].availableForResale = false;
        purchasedItems[serialNumber].ownerHistory.push(msg.sender);
    }

    function addWarranty(
        string memory serialNumber,
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

    function itemExists(string memory serialNumber)
        private
        view
        returns (bool)
    {
        bool exists;
        for (uint i = 0; i < serialNumbers.length; i++) {
            if (stringsEquals(serialNumbers[i], serialNumber)) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    function getLastOwner(string memory serialNumber)
        private
        view
        returns (address)
    {
        return
            purchasedItems[serialNumber].ownerHistory[
                purchasedItems[serialNumber].ownerHistory.length - 1
            ];
    }

    function getItemOwner(string memory serialNumber, uint index)
        public
        view
        returns (address)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return purchasedItems[serialNumber].ownerHistory[index];
    }

    function getItemOwnerLength(string memory serialNumber)
        public
        view
        returns (uint)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return purchasedItems[serialNumber].ownerHistory.length;
    }

    function getItemWarranty(string memory serialNumber, uint index)
        public
        view
        returns (WarrantyInfo memory)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return warrantyInfos[serialNumber][index];
    }

    function getItemWarrantyLength(string memory serialNumber)
        public
        view
        returns (uint)
    {
        require(itemExists(serialNumber), "Item does not exist!");
        return warrantyInfos[serialNumber].length;
    }

    function stringsEquals(string memory s1, string memory s2)
        private
        pure
        returns (bool)
    {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i = 0; i < l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function isWarrantyExpired(string memory serialNumber)
        public
        view
        returns (bool)
    {
        return
            purchasedItems[serialNumber].creationTime +
                items[purchasedItems[serialNumber].itemId].warrantyPeriod >
            block.timestamp;
    }

    function hashString(string memory serialNumber)
        public
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(serialNumber)));
    }
}
