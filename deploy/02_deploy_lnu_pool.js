// 02_deploy_lnu_pool.js
// 本脚本部署主链上的 NFTPoolLockAndRelease 合约，用于锁定 NFT 并发送 CCIP 消息。
const {getNamedAccounts, network} = require("hardhat")
const {developmentChains, networkConfig} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts, deployments}) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    // 获取构造函数参数
    let sourceChainRouter
    let linkToken
    let nftAddr
    if(developmentChains.includes(network.name)) {
        // 本地开发链时，从本地 CCIP 模拟器获取路由器和 LINK 地址
        const ccipSimulatorTx = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorTx.address)
        const ccipSimulatorConfig = await ccipSimulator.configuration()
        sourceChainRouter = ccipSimulatorConfig.sourceRouter_
        linkToken = ccipSimulatorConfig.linkToken_       
        log(`local environment: sourcechain router: ${sourceChainRouter}, link token: ${linkToken}`) 
    } else {
        // 非本地网络时，从配置文件获取路由器和 LINK 地址
        sourceChainRouter = networkConfig[network.config.chainId].router
        linkToken = networkConfig[network.config.chainId].linkToken
        log(`non local environment: sourcechain router: ${sourceChainRouter}, link token: ${linkToken}`)
    }
    
    // 获取已部署的 NFT 合约地址
    const nftTx = await deployments.get("MyToken")
    nftAddr = nftTx.address
    log(`NFT address: ${nftAddr}`)

    log("deploying the lmn pool")
    await deploy("NFTPoolLockAndRelease", {
        contract: "NFTPoolLockAndRelease",
        from: firstAccount,
        log: true,
        args: [sourceChainRouter, linkToken, nftAddr]
    })
    log("lmn pool deployed")
}

module.exports.tags = ["all", "sourcechain"]