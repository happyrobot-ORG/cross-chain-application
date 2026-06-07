// 04_deploy_mnb_pool.js
// 本脚本部署目标链上的 NFTPoolBurnAndMint 合约，用于在目标链上铸造包装 NFT。
const { network } = require("hardhat")

module.exports = async({getNamedAccounts, deployments}) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments
    const {developmentChains, networkConfig} = require("../helper-hardhat-config")
    
    let router
    let linkTokenAddr
    let wnftAddr
    if(developmentChains.includes(network.name)) {
        // 本地开发链时，从 CCIP 本地模拟器读取目标链路由器和 LINK 地址
        const ccipSimulatorTx = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorTx.address)
        const ccipConfig = await ccipSimulator.configuration()
        router = ccipConfig.destinationRouter_
        linkTokenAddr = ccipConfig.linkToken_        
    } else {
        // 非本地网络时，从配置文件读取路由器和 LINK 地址
        router = networkConfig[network.config.chainId].router
        linkTokenAddr = networkConfig[network.config.chainId].linkToken
    }

    // 获取 WrappedNFT 合约地址
    const wnftTx = await deployments.get("WrappedNFT")
    wnftAddr = wnftTx.address

    log(`get the parameters: ${router}, ${linkTokenAddr}, ${wnftAddr}`)
    log("deploying nftPoolBurnAndMint")
    await deploy("NFTPoolBurnAndMint", {
        contract: "NFTPoolBurnAndMint",
        from: firstAccount,
        log: true,
        args: [router, linkTokenAddr, wnftAddr]
    })
    log("nftPoolBurnAndMint deployed")
}

module.exports.tags = ["all", "destchain"]