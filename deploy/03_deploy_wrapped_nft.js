// 03_deploy_wrapped_nft.js
// 本脚本部署目标链上的 WrappedNFT 合约，用于接收跨链转移后的 NFT。
module.exports = async({getNamedAccounts, deployments}) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("deploying wrapped NFT on destination chain")
    await deploy("WrappedNFT", {
        contract: "WrappedNFT",
        from: firstAccount,
        log: true,
        args: ["WrappedNFT", "WNFT"]
    })
    log("deployed wrapped nft")
}

module.exports.tags = ["all", "destchain"]