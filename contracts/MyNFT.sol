// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    // 默认 NFT 元数据 URI，所有铸造的 NFT 使用相同的 metadata 地址。
    string constant public METADATA_URI = "ipfs://QmXw7TEAJWKjKifvLE25Z9yjvowWk2NWY3WgnZPUto9XoA";
    // 下一个要铸造的 Token ID，自增计数。
    uint256 private _nextTokenId;

    /// @notice 构造函数，初始化 ERC721 名称和符号，并设置合约所有者。
    /// @param tokenName ERC721 代币名称。
    /// @param tokenSymbol ERC721 代币符号。
    constructor(string memory tokenName, string memory tokenSymbol)
        ERC721(tokenName, tokenSymbol)
        Ownable(msg.sender)
    {}

    /// @notice 安全铸造一个新的 NFT 到指定地址。
    /// @param to 接收 NFT 的地址。
    function safeMint(address to)
        public
    {
        uint256 tokenId = _nextTokenId++;
        // 使用 _safeMint 确保接收者地址能正确接收 ERC721。
        _safeMint(to, tokenId);
        // 为新铸造的 NFT 设置元数据 URI。
        _setTokenURI(tokenId, METADATA_URI);
    }

    // 以下函数是 Solidity 继承冲突时必须重写的覆盖函数。

    /// @notice 内部更新持有者信息，继承自 ERC721 和 ERC721Enumerable。
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /// @notice 内部增加账户 ERC721 余额，继承自 ERC721 和 ERC721Enumerable。
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /// @notice 返回指定 Token ID 的元数据 URI。
    /// @param tokenId 要查询的 NFT ID。
    /// @return 返回 NFT 的 URI。
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /// @notice 查询合约是否支持指定接口。
    /// @param interfaceId 接口标识符。
    /// @return 如果支持该接口则返回 true。
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}