// 01_deploy_nft.js
// 本脚本用于部署主链上的 NFT 合约 MyToken。
const { getNamedAccounts } = require("hardhat");

module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy, log} = deployments
    
    log("Deploying the nft contract")
    await deploy("MyToken", {
        contract: "MyToken",
        from: firstAccount,
        log: true,
        args: ["MyNFT", "MNT"]
    })
    log("MyToken is deployed!")
}

module.exports.tags = ["all", "sourcechain"]