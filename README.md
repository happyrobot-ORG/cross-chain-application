# 实践成果-NFT
token地址：
https://sepolia.etherscan.io/token/0x24fe4605912266c0bbe65f02ce4ddcc21e0998ec
合约地址：
https://sepolia.etherscan.io/address/0x24fe4605912266c0bbe65f02ce4ddcc21e0998ec


# 实践成果-跨链-ccip消息跨链
1. 跨链交易hash
https://ccip.chain.link/msg/0x5204d4ed7ade40887e434daa54b1bb0f087c1889687506fc47ca0fbc3883c908
2. 原链 MyToken NFT合约地址
https://sepolia.etherscan.io/token/0x24fe4605912266c0bbe65f02ce4ddcc21e0998ec
3. 原链 NFT池子 合约地址
https://sepolia.etherscan.io/address/0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171
4. 目标链 WrappedMyToken NFT合约地址
https://amoy.polygonscan.com/token/0xcdaa88e1a79889cec273ebcf1497d8e48cd9b915#transactions
5. 目标链 WNFT池子 合约地址
https://amoy.polygonscan.com/address/0xf4dd51A3d6a4beb57233a004Fc7DF33095952A26

## 原链铸造，原链锁定发消息

1. 在 source chain 部署合约：npx hardhat deploy --tags sourcechain --network sepolia，如果你在上一步使用的不是 sepolia 和 amoy，那么请相应调整 network 名字

2. 在 dest chain 部署合约：npx hardhat deploy --tags destchain --network amoy 如果你在上一步使用的不是 sepolia 和 amoy，那么请相应调整 network 名字

3. 铸造 nft：npx hardhat mint-nft --network sepolia

4. 查看 nft 状态：npx hardhat check-nft --network sepolia

5. 锁定并且跨链 nft：npx hardhat lock-and-cross --tokenid 0 --network sepolia

结果输出：
sepolia 链
1. 发布者地址： 0x1573B70e15343b7983Bc3836470765c9025fe1e4
2. nft地址： 0x24FE4605912266C0bbE65F02Ce4ddcC21e0998ec
3. nft池子地址： 0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171
deployer is 0x1573B70e15343b7983Bc3836470765c9025fe1e4
nft address is 0x24FE4605912266C0bbE65F02Ce4ddcC21e0998ec
deploying "NFTPoolLockAndRelease" (tx: 0xb2a0dd68393d301ad61b47e320402070a0fc32c4c67bace35b2936b739839a85)...: deployed at 0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171 with 2564601 gas

amoy 链
1. 发布者地址： 0x1573B70e15343b7983Bc3836470765c9025fe1e4
2. wnft地址： 0xCDAa88E1a79889CEC273EBcf1497D8e48Cd9B915
3. wnft池子地址： 0xf4dd51A3d6a4beb57233a004Fc7DF33095952A26
deploying "WrappedNFT" (tx: 0xe16b87d1523485de04937fd5739e90661d79f281be19d793688430412b0f7020)...: deployed at 0xCDAa88E1a79889CEC273EBcf1497D8e48Cd9B915 with 2671199 gas
deploying "NFTPoolBurnAndMint" (tx: 0x8b07ea8d01f854fb01492edd2ca48471e70e824a195c83aa224a806c8dc16def)...: deployed at 0xf4dd51A3d6a4beb57233a004Fc7DF33095952A26 with 2500048 gas

锁定且跨链 lock-and-cross
```
deployer is 0x1573B70e15343b7983Bc3836470765c9025fe1e4
NFTPoolBurnAndMint address on destination chain is 0xf4dd51A3d6a4beb57233a004Fc7DF33095952A26
destination chain selector is 16281711391670634445
balance before: 10000000000000000000
deployer LINK balance: 165000000000000000000
balance after: 20000000000000000000
NFT owner of token 0: 0x1573B70e15343b7983Bc3836470765c9025fe1e4
NFT approved to: 0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171
isApprovedForAll for pool: false
approve transaction submitted for token 0 to pool 0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171
NFT approved after tx: 0xE527Ab0a02E4d5D7b346fDb83A9c19ADa01eB171
0, 0x1573B70e15343b7983Bc3836470765c9025fe1e4, 16281711391670634445, 0xf4dd51A3d6a4beb57233a004Fc7DF33095952A26
NFT locked and crossed, transaction hash is 0xc33d315102208c154778c6fb239bff5cae9dee4b41f0522fb3eb6cafd0e6109e
```

ccip 浏览器查看
通过sourcetx搜索： 0xc33d315102208c154778c6fb239bff5cae9dee4b41f0522fb3eb6cafd0e6109e
https://ccip.chain.link/msg/0x5204d4ed7ade40887e434daa54b1bb0f087c1889687506fc47ca0fbc3883c908

## 最大的nft交易市场
http://opensea.io

## openzeppelin开发向导：
https://wizard.openzeppelin.com/

## opensea的metadata标准
https://docs.opensea.io/docs/metadata-standards
json格式的文件

## 去中心化存储 IPFS
https://ipfs.tech/
### filebase使用
问题：ipfs使用难度大，支付费用，搭建节点
解决：有三方公司，基于ipfs网络提供服务，方便更好的接入

### filebase使用详情
1.上传一个图片，得到图片的ipfs地址
https://foreign-maroon-stork.myfilebase.com/ipfs/QmUa7GMUyJVUYTHoRVQW9wryy4u78mnv1sYphvCw8cHYKD

2.上次一个json文件，里面还有描述信息和图片ipfs地址
https://foreign-maroon-stork.myfilebase.com/ipfs/QmW3xpbWwyPeJD8RyiZ9ULTToUj3R7Zr2GuvFeWPstFdPK
```
{
  "name": "Cute Puppy",
  "description": "A cute puppy stored on IPFS via Filebase.",
  "image": "ipfs://QmUa7GMUyJVUYTHoRVQW9wryy4u78mnv1sYphvCw8cHYKD",
  "attributes": [
    {
      "trait_type": "Animal",
      "value": "Dog"
    },
    {
      "trait_type": "Mood",
      "value": "Cute"
    },
    {
      "trait_type": "Background",
      "value": "Blue"
    }
  ]
}
```
### 将MyNftToken部署。可以在remix中进行
1.粘贴代码
2.链上metamask 测试网络sepolia
3.部署，选择钱包地址
4.safeMint
5.totalSupply查看铸造结果
6.tokenURI，传tokenId=0。查询tokenId对应的metadataURI
7.去opensea的测试网站上看自己的metadataURI的展示效果
1. 登录自己的钱包账号
2. 查看自己的钱包nft 
3. 为何可以展示：opensea测试网会根据钱包地址，查询出这个地址拥有的nft

# 部署指令和交互指令
- npx env-enc set
238567

- 用run脚本文件部署
npx hardhat run scripts/deploy.js

- 用task任务的形式进行部署
npx hardhat deploy-fundMe
npx hardhat interact-fundMe --contract 0x3eEED288c1052aA16adedbfb9E0EC49BD478809F

- 用test框架部署
npx hardhat test --network sepolia

[中文](#内容介绍) | [English](#introduction)
## 内容介绍
这是第六课的代码部分，在这部分代码中，我们构建一个 ERC721 的合约，让这个合约可以被从 Sepolia 区块链被跨链跨到 Amoy 区块链。<br>

完成整个过程需要先在 Sepolia 区块链部署合约：
- ERC-721合约 MyToken：这个合约是我们需要用到的 NFT
- NFTPoolLockAndRelease：用来锁定用户合约，并且执行跨链操作，在 Amoy 区块链上铸造一个新的 NFT

在 Amoy 区块链上部署合约
- 基于 ERC-721 合约的包装合约 WrappedMyToken：这个合约会用来铸造和燃烧 NFT，因为 NFT 的主合约在 Sepolia 上，所在 Amoy 的 NFT 合约需要先进行铸造。
- NFTPoolMintAndBurn：通过 `ccipReceive` 来接受跨链消息，然后基于消息内容铸造 NFT，同时在 Amoy 中的 NFT 跨链回到 Sepolia 的时候，将 NFT 进行燃烧。

## 如何使用
1. 将 repo clone到本地：
`git clone https://github.com/smartcontractkit/Web3_tutorial_Chinese.git`

2. 进入 lesson-6 文件夹
`cd Web3_tutorial_Chinese/lesson-6`

3. 安装 npm package：`npm install`

4. 测试合约：`npx hardhat test`，此过程使用到了 chainlink-local，会在链下模拟 ccip 行为

5. 通过 env-enc 添加配置信息：
```
npx env-enc set-pw
npx env-enc set
```
依次加入环境变量：
```
PRIVATE_KEY
SEPOLIA_RPC_URL
AMOY_RPC_URL
```

6. 在 source chain 部署合约：`npx hardhat deploy --tags sourcechain --network sepolia`，如果你在上一步使用的不是 sepolia 和 amoy，那么请相应调整 network 名字

7. 在 dest chain 部署合约：`npx hardhat deploy --tags destchain --network amoy` 如果你在上一步使用的不是 sepolia 和 amoy，那么请相应调整 network 名字

8. 铸造 nft：`npx hardhat mint-nft --network sepolia`

9. 查看 nft 状态：`npx hardhat check-nft --network sepolia`

10. 锁定并且跨链 nft：`npx hardhat lock-and-cross --tokenid 0 --network sepolia`

11. 查看 wrapped NFT 状态：`npx hardhat check-wrapped-nft --tokenid 0 --network amoy`

12. 燃烧并且跨链 wnft：`npx hardhat burn-and-cross --tokenid 0 --network amoy`

13. 再次查看 nft 状态：`npx hardhat check-nft --network sepolia`

更多的相关内容请查看[Web3_tutorial](https://github.com/smartcontractkit/Web3_tutorial_Chinese)的 `README.md`。


## Introduction
This is the code section of lesson 6. In this part of the code, we build an ERC721 contract that allows the NFT to be cross-chained from the Sepolia blockchain to the Amoy blockchain.<br>

To complete the entire process, it is necessary to deploy contracts on the Sepolia blockchain first:

- ERC-721 contract MyToken: This contract is the NFT we need.
- NFTPoolLockAndRelease: Used to lock user contracts and perform cross-chain operations, minting a new NFT on the Amoy blockchain.

Deploy contracts on the Amoy blockchain:

- WrappedMyToken, a wrapper contract based on the ERC-721 contract: This contract is used to mint and burn NFTs. Because the main NFT contract is on Sepolia, the NFT contract on Amoy needs to be minted first.
- NFTPoolMintAndBurn: Used to receive cross-chain messages through ccipReceive, mint NFTs based on message content, and burn NFTs when they are cross-chained back to Sepolia from Amoy.
## Getting started
1. Clone the repo to your local machine:
`git clone https://github.com/QingyangKong/Web3_tutorial_lesson6.git`

2. change directory to folder lesson-6
`cd Web3_tutorial_Chinese/lesson-6`

3. Install npm packages: `npm install`

4. Test contracts: `npx hardhat test`. This process uses chainlink-local to simulate ccip behavior on the chain.

5. Add configuration information through env-enc:
```
npx env-enc set-pw
npx env-enc set
```
Add environment variables in sequence:
```
PRIVATE_KEY
SEPOLIA_RPC_URL
AMOY_RPC_URL
```

6. Deploy contracts on the source chain: `npx hardhat deploy --tags sourcechain --network sepolia`. If you did not use sepolia and Amoy in the previous step, adjust the network name accordingly.

7. Deploy contracts on the dest chain: `npx hardhat deploy --tags destchain --network amoy`. If you did not use sepolia and Amoy in the previous step, adjust the network name accordingly.

8. Mint nft: `npx hardhat mint-nft --network sepolia`

9. Check nft status: `npx hardhat check-nft --network sepolia`

10. Lock and cross nft: `npx hardhat lock-and-cross --tokenid 0 --network sepolia`

11. Check wrapped NFT status: `npx hardhat check-wrapped-nft --tokenid 0 --network amoy`

12. Burn and cross wnft: `npx hardhat burn-and-cross --tokenid 0 --network amoy`

13. Check nft status again：`npx hardhat check-nft --network sepolia`

For more related content, please refer to the README.md of [Web3_tutorial](https://github.com/smartcontractkit/Web3_tutorial_Chinese).