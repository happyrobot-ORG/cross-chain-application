// 01_deploy_nft.js
// 本脚本用于部署主链上的 NFT 合约 MyToken。
const { getNamedAccounts, ethers } = require("hardhat");

module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy, log} = deployments
    
    log("Deploying the nft contract")
    // 得到部署的MyToken合约实例，传入构造函数参数为NFT的名称和符号。
    const myToken = await deploy("MyToken", {
        contract: "MyToken",
        from: firstAccount,
        log: true,
        args: ["MyNFT", "MNT"]
    })
    log("MyToken is deployed!")

    // get an ethers Contract instance for the deployed contract
    const myTokenContract = await ethers.getContract("MyToken", firstAccount)

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
      // try to obtain a deployment transaction hash from the deployment result
      const txHash = myToken.receipt && myToken.receipt.transactionHash ? myToken.receipt.transactionHash : (myToken.transactionHash || null)
      if (txHash) {
        console.log("wait for 3 confirmations")
        const tx = await ethers.provider.getTransaction(txHash)
        await tx.wait(3)
      } else {
        console.log("no deployment transaction available (contract reused); skipping wait")
      }
      console.log("verifying contract on etherscan...")
      await verify(myToken.address, ["MyNFT", "MNT"])
    } else {
      console.log("skipping verification")
    }

}

async function verify(address, args) {
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: args,
  });
}

module.exports.tags = ["all", "sourcechain"]