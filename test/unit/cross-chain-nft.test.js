const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { expect } = require("chai")

let firstAccount
let nft
let wnft
let poolLnU
let poolMnB
let chainSelector

// 全局 before 钩子，在所有测试前执行一次，部署合约并获取合约实例。
before(async function(){
    firstAccount = (await getNamedAccounts()).firstAccount
    await deployments.fixture(["all"])
    nft = await ethers.getContract("MyToken", firstAccount)
    wnft = await ethers.getContract("WrappedNFT", firstAccount)
    poolLnU = await ethers.getContract("NFTPoolLockAndRelease", firstAccount)
    poolMnB = await ethers.getContract("NFTPoolBurnAndMint", firstAccount)
    ccipLocalSimulator = await ethers.getContract("CCIPLocalSimulator", firstAccount)
    chainSelector = (await ccipLocalSimulator.configuration()).chainSelector_
})

describe("测试 NFT 是否能成功铸造", 
    async function(){
        it("测试 NFT 的拥有者是否为铸造者", 
            async function(){
                // 铸造 NFT 给 firstAccount
                await nft.safeMint(firstAccount)
                // 查询 NFT 的拥有者
                const ownerOfNft = await nft.ownerOf(0)
                expect(ownerOfNft).to.equal(firstAccount)
            })
    })

describe("测试 NFT 是否能锁定并转移到目标链", async function() {
        it("从源链锁定 NFT 并通过 CCIP 发送到目标链，同时检查 NFT 是否被锁定", async function() {
                // 给源链池子充值 LINK，用于支付 CCIP 费用
                await ccipLocalSimulator.requestLinkFromFaucet(poolLnU.target, ethers.parseEther("10"))

                // 授权池子转移 NFT
                await nft.approve(poolLnU.target, 0)
                // 调用 lockAndSendNFT 锁定 NFT 并发送跨链消息
                await poolLnU.lockAndSendNFT(0, firstAccount, chainSelector, poolMnB.target)
                
                // 检查 NFT 是否已经转移到池子地址
                const newOwner = await nft.ownerOf(0)
                expect(newOwner).to.equal(poolLnU.target)
            }
        )
        it("检查目标链上的包装 NFT 是否被铸造给最终接收者", async function() {
                const newOwner = await wnft.ownerOf(0)
                expect(newOwner).to.equal(firstAccount)
            }
        )
    }
)

describe("测试 NFT 是否能销毁并转回源链", async function() {
        it("测试 Wrapped NFT 是否可以销毁", async function() {
                // 给目标链池子充值 LINK，用于支付 CCIP 费用
                await ccipLocalSimulator.requestLinkFromFaucet(poolMnB.target, ethers.parseEther("10"))
                
                // 授权目标链池子转移 Wrapped NFT
                await wnft.approve(poolMnB.target, 0)

                // 调用 burnAndMint 将 Wrapped NFT 销毁并发送回源链
                await poolMnB.burnAndMint(0, firstAccount, chainSelector, poolLnU.target)
                const wnftTotalSupply = await wnft.totalSupply()
                expect(wnftTotalSupply).to.equal(0)
            }
        )
        it("测试 NFT 的所有权是否已转回 firstAccount", async function() {
                const newOwner = await nft.ownerOf(0)
                expect(newOwner).to.equal(firstAccount)
            }
        )
    }
)