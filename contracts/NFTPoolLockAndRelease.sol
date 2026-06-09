// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {MyToken} from "./MyNFT.sol";

/**
 * 这是一个示例合约，使用硬编码值以便于说明。
 * 这是一个示例合约，使用未经审核的代码。
 * 切勿在生产环境中使用此代码。
 * https://docs.chain.link/ccip/tutorials/evm/send-arbitrary-data#tutorial
 */

/// @title - 一个简单的跨链字符串消息发送/接收合约。
contract NFTPoolLockAndRelease is CCIPReceiver, OwnerIsCreator {
    using SafeERC20 for IERC20;

    // 自定义错误，用于提供更具体的 revert 信息。
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // 用于确保合约余额足够支付费用。
    error NothingToWithdraw(); // 在尝试提取 Ether 时，如果没有余额则抛出。
    error FailedToWithdrawEth(address owner, address target, uint256 value); // 在 Ether 提取失败时抛出。

    // 发送跨链消息时触发的事件。
    event MessageSent(
        bytes32 indexed messageId, // CCIP 消息的唯一 ID。
        uint64 indexed destinationChainSelector, // 目标链的选择器。
        address receiver, // 目标链上消息接收者的地址。
        bytes text, // 发送的消息内容。
        address feeToken, // 用于支付 CCIP 费用的代币地址。
        uint256 fees // 发送 CCIP 消息时支付的费用。
    );

    // 接收到跨链消息时触发的事件。
    event TokenUnlocked(
        uint256 tokenId,
        address newOwner
    );

    bytes32 private s_lastReceivedMessageId; // 保存最后接收到的消息 ID。
    string private s_lastReceivedText; // 保存最后接收到的消息文本。

    // 记录允许的目标链。
    mapping(uint64 => bool) public allowlistedDestinationChains;

    // 记录允许的来源链。
    mapping(uint64 => bool) public allowlistedSourceChains;

    // 记录允许的发送者地址。
    mapping(address => bool) public allowlistedSenders;

    IERC20 private s_linkToken;
    
    // 记得为变量添加可见性。
    MyToken public nft;
    
    struct RequestData{
        uint256 tokenId;
        address newOwner;
    }

    // 记得为变量添加可见性。
    mapping(uint256 => bool) public tokenLocked;


    /// @notice 构造函数，使用 Router 地址初始化合约。
    /// @param _router Router 合约地址。
    /// @param _link LINK 代币合约地址。
    /// @param nftAddr 要操作的 NFT 合约地址。
    constructor(address _router, address _link, address nftAddr) CCIPReceiver(_router) {
        s_linkToken = IERC20(_link);
        nft = MyToken(nftAddr);
    }

    /// @dev 更新目标链的白名单状态。
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = allowed;
    }

    /// @dev 更新来源链的白名单状态。
    function allowlistSourceChain(
        uint64 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = allowed;
    }

    /// @dev 更新发送者的白名单状态。
    function allowlistSender(address _sender, bool allowed) external onlyOwner {
        allowlistedSenders[_sender] = allowed;
    }

    /// @notice 将 NFT 锁定在本合约中，并发送 CCIP 消息到另一条链。
    /// @param tokenId 要锁定并跨链转移的 NFT ID。
    /// @param newOwner 目标链上 NFT 的最终接收者地址。
    ///        它应当是目标链上的地址，可以是普通用户地址（EOA）或合约地址。
    ///        在本实现中，消息负载中包含 `newOwner`，目标链上的接收合约会解码它并将 NFT 转给该地址。
    /// @param destChainSelector Chainlink CCIP 的目标链选择器，用于指定要发送到哪条链。
    ///        它告诉 CCIP 这条消息应该被发送到哪个目标链。
    /// @param destReceiver 目标链上接收 CCIP 消息的地址。
    ///        这通常是处理入站消息的目标合约地址，而不一定是 NFT 的最终拥有者。
    function lockAndSendNFT(
        uint256 tokenId,
        address newOwner,
        uint64 destChainSelector,
        address destReceiver
    ) public returns (bytes32){
        // 验证交易是否由 NFT 拥有者发起，并给出更明确的错误信息。
        require(nft.ownerOf(tokenId) == msg.sender, "NFTPoolLockAndRelease: sender is not owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "NFTPoolLockAndRelease: NFT not approved to pool"
        );

        // 将 NFT 从用户转移到本合约中锁定。
        nft.transferFrom(msg.sender, address(this), tokenId);
        // 发送 CCIP 请求，将 NFT 跨链发送到目标链。
        bytes memory payload = abi.encode(tokenId, newOwner);
        bytes32 messageId = sendMessagePayLINK(destChainSelector, destReceiver, payload);
        tokenLocked[tokenId] = true;
        return messageId;
    }

    /// @notice 将数据发送到目标链上的接收者。
    /// @notice 使用 LINK 支付费用。
    /// @dev 假设合约中有足够的 LINK。
    /// @param _destinationChainSelector 目标区块链的标识符（选择器）。
    /// @param _receiver 目标区块链上接收消息的地址。
    /// @param _payload 要发送的数据。
    /// @return messageId 发送的 CCIP 消息 ID。
    function sendMessagePayLINK(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes memory _payload
    )
        internal
        returns (bytes32 messageId)
    {
        // 在内存中创建 EVM2AnyMessage 结构体，包含发送跨链消息所需的信息。
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _payload,
            address(s_linkToken)
        );

        // 初始化 Router 客户端实例，用于与跨链路由器交互。
        IRouterClient router = IRouterClient(this.getRouter());

        // 获取发送 CCIP 消息所需的费用。
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        // 批准 Router 代表本合约转移 LINK 代币，用于支付费用。
        s_linkToken.approve(address(router), fees);

        // 通过 Router 发送 CCIP 消息，并保存返回的消息 ID。
        messageId = router.ccipSend(_destinationChainSelector, evm2AnyMessage);

        // 触发事件，记录消息发送详情。
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _payload,
            address(s_linkToken),
            fees
        );

        // 返回 CCIP 消息 ID。
        return messageId;
    }

    /// 处理接收到的消息。
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
    {
        s_lastReceivedMessageId = any2EvmMessage.messageId; // 获取消息 ID。
        RequestData memory requestData = abi.decode(any2EvmMessage.data, (RequestData));
        uint256 tokenId = requestData.tokenId;
        address newOwner = requestData.newOwner;
        require(tokenLocked[tokenId], "the NFT is not locked");
        nft.transferFrom(address(this), newOwner, tokenId);
        emit TokenUnlocked(tokenId, newOwner);
    }

    /// @notice 构造 CCIP 消息。
    /// @dev 该函数将创建一个包含发送文本所需信息的 EVM2AnyMessage 结构体。
    /// @param _receiver 接收者的地址。
    /// @param _payload 要发送的字符串数据。
    /// @param _feeTokenAddress 用于支付费用的代币地址。设置 address(0) 表示使用原生 gas。
    /// @return Client.EVM2AnyMessage 返回一个包含发送 CCIP 消息信息的 EVM2AnyMessage 结构体。
    function _buildCCIPMessage(
        address _receiver,
        bytes memory _payload,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // 在内存中创建一个包含发送跨链消息所需信息的 EVM2AnyMessage 结构体。
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI 编码后的接收者地址。
                data: _payload, // ABI 编码后的数据。
                tokenAmounts: new Client.EVMTokenAmount[](0), // 空数组，表示不转移代币。
                extraArgs: Client._argsToBytes(
                    // 附加参数，设置 gas 限制。
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                // 设置 feeToken 为费用支付代币地址。
                feeToken: _feeTokenAddress
            });
    }

    /// @notice 获取最后接收到的消息详情。
    /// @return messageId 最后接收消息的 ID。
    /// @return text 最后接收消息的文本。
    function getLastReceivedMessageDetails()
        external
        view
        returns (bytes32 messageId, string memory text)
    {
        return (s_lastReceivedMessageId, s_lastReceivedText);
    }

    /// @notice 回退函数，允许合约接收 Ether。
    /// @dev 该函数没有函数体，用于在发送无数据 Ether 时接收资金。
    /// 当 Ether 直接发送到合约且不带数据时会自动调用。
    receive() external payable {}

    /// @notice 允许合约所有者提取合约中的全部 Ether 余额。
    /// @dev 如果没有可提取资金或转账失败则 revert。
    /// 该函数只能由合约所有者调用。
    /// @param _beneficiary 接收 Ether 的地址。
    function withdraw(address _beneficiary) public onlyOwner {
        // 获取本合约的 Ether 余额。
        uint256 amount = address(this).balance;

        // 如果没有可提取余额则 revert。
        if (amount == 0) revert NothingToWithdraw();

        // 尝试发送 Ether，记录发送结果并忽略返回数据。
        (bool sent, ) = _beneficiary.call{value: amount}("");

        // 如果发送失败则 revert，并返回失败信息。
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    /// @notice 允许合约所有者提取指定 ERC20 代币的全部余额。
    /// @dev 如果没有可提取的代币余额则 revert 并抛出 NothingToWithdraw。
    /// @param _beneficiary 接收代币的地址。
    /// @param _token 要提取的 ERC20 代币合约地址。
    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        // 获取本合约持有的该 ERC20 代币余额。
        uint256 amount = IERC20(_token).balanceOf(address(this));

        // 如果没有可提取代币则 revert。
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }
}
