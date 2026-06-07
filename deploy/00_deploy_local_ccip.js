// 00_deploy_local_ccip.js
// 本脚本仅在开发环境中部署本地 CCIP 模拟器，用于本地测试和模拟跨链消息。
const { getNamedAccounts, deployments, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts, deployments}) => {

    // 仅在本地开发链时才部署 CCIP 模拟器
    if(developmentChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts()
        const { deploy, log } = deployments
        log("deploy the CCIP local simulator")
        await deploy("CCIPLocalSimulator", {
            contract: "CCIPLocalSimulator",
            from: firstAccount,
            log: true,
            args: []
        })
        log("CCIP local simulator deployed!")
    } else {
        // 非本地网络则跳过部署
        log("not in local, skip CCIP local")
    }
}

module.exports.tags = ["all", "test"]