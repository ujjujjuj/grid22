//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract FlipkartItem is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    struct Item {
        address[] ownerHistory;
        uint itemId;
        string itemURI;
        uint value;
        uint creationTime;
        uint warrantyPeriod;
        bool isPurchased;
        bool availableForResale;
        bool isSoulbound;
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
    }

    mapping(string => WarrantyInfo[]) public warrantyInfos;
    mapping(string => Item) public items;
    string[] public serialNumbers;

    constructor() ERC721("FlipkartItem", "FLITM") { }

    function createItem(string memory serialNumber, string memory itemURI, uint value, uint warrantyPeriod, bool isSoulbound) public onlyOwner {
        address[] memory emptyAddressList;
        items[serialNumber] = Item(emptyAddressList, _itemIds.current(), itemURI, value, 0, warrantyPeriod, false, false, isSoulbound);
        serialNumbers.push(serialNumber);
        _itemIds.increment();
    }

    function buyItem(string memory serialNumber) public payable {
        require(itemExists(serialNumber), "Item does not exist!");
        require(!items[serialNumber].isPurchased, "Item is not for sale!");
        require(msg.value == items[serialNumber].value, "Incorrect amount of ether sent!");

        _mint(msg.sender, items[serialNumber].itemId);
        items[serialNumber].isPurchased = true;
        items[serialNumber].creationTime = block.timestamp;
        items[serialNumber].ownerHistory.push(msg.sender);
    }

    function totalItems() public view returns(uint){
        return serialNumbers.length;
    }

    function setValue(string memory serialNumber, uint value) public {
        require(itemExists(serialNumber), "Item does not exist!");
        if(items[serialNumber].isPurchased) {
            require(msg.sender == getLastOwner(serialNumber), "Unauthorized to set value!");
        } else {
            require(msg.sender == owner(), "Unauthorized to set value!");
        }

        items[serialNumber].value = value;
    }

    function itemExists(string memory serialNumber) view private returns(bool){
        bool exists;
        for(uint i = 0; i < serialNumbers.length; i++){
            if(stringsEquals(serialNumbers[i], serialNumber)){
                exists = true;
                break;
            }
        }

        return exists;
    } 

    function getLastOwner(string memory serialNumber) view private returns(address) {
        return items[serialNumber].ownerHistory[items[serialNumber].ownerHistory.length - 1];
    }

    function putForResale(string memory serialNumber) public {
        require(itemExists(serialNumber), "Item does not exist!");
        require(msg.sender == getLastOwner(serialNumber), "Unauthorized to resell item!");
        require(!items[serialNumber].isSoulbound, "Cannot resell, item is soulbound!");

        items[serialNumber].availableForResale = true;
    }
    
    function buyResaleItem(string memory serialNumber) public payable {
        require(itemExists(serialNumber), "Item does not exist!");
        require(items[serialNumber].availableForResale, "Item not available for resale!");
        require(items[serialNumber].value == msg.value, "Incorrect amount of ether sent!");

        address lastOwner = getLastOwner(serialNumber);
        payable(lastOwner).transfer(msg.value);
        _transfer(lastOwner, msg.sender, items[serialNumber].itemId);

        items[serialNumber].availableForResale = false;
        items[serialNumber].ownerHistory.push(msg.sender);
    }

    function addWarranty(string memory serialNumber, uint warrantyReason, uint warrantyOutcome) public onlyOwner {
        require(isWarrantyExpired(serialNumber), "Warranty has expired!");
        warrantyInfos[serialNumber].push(WarrantyInfo(WarrantyReason(warrantyReason), WarrantyOutcome(warrantyOutcome)));
    }

    function getItemOwner(string memory serialNumber, uint index) public view returns(address) {
        require(itemExists(serialNumber), "Item does not exist!");
        return items[serialNumber].ownerHistory[index];
    }

    function getItemOwnerLength(string memory serialNumber) public view returns(uint) {
        require(itemExists(serialNumber), "Item does not exist!");
        return items[serialNumber].ownerHistory.length;
    }

    function getItemWarranty(string memory serialNumber, uint index) public view returns(WarrantyInfo memory) {
        require(itemExists(serialNumber), "Item does not exist!");
        return warrantyInfos[serialNumber][index];
    }

    function getItemWarrantyLength(string memory serialNumber) public view returns(uint) {
        require(itemExists(serialNumber), "Item does not exist!");
        return warrantyInfos[serialNumber].length;
    }

    // https://ethereum.stackexchange.com/questions/4559/operator-not-compatible-with-type-string-storage-ref-and-literal-string#comment88932_11754
    function stringsEquals(string memory s1, string memory s2) private pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i=0; i < l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function isWarrantyExpired(string memory serialNumber) public view returns(bool) {
        return items[serialNumber].creationTime + items[serialNumber].warrantyPeriod > block.timestamp;
    }

}