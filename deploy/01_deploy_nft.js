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

      // wait for code to be present on-chain and for confirmations, then verify with retries
      try {
        await waitForCodeAndConfirm(myToken.address, txHash, 3, 5 * 60 * 1000)
        console.log("verifying contract on etherscan...")
        await verifyWithRetries(myToken.address, ["MyNFT", "MNT"], 5)
      } catch (err) {
        console.error("Verification skipped/failed:", err.message || err)
      }
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

// wait until contract code is present and the deployment transaction has the required confirmations
async function waitForCodeAndConfirm(address, txHash, confirmations = 3, timeoutMs = 300000) {
  const start = Date.now()
  const provider = ethers.provider

  while (true) {
    const code = await provider.getCode(address)
    if (code && code !== '0x') {
      if (txHash) {
        const tx = await provider.getTransaction(txHash)
        if (tx && tx.blockNumber) {
          const current = await provider.getBlockNumber()
          const confs = current - tx.blockNumber
          if (confs >= confirmations) return
        }
      } else {
        // no txHash (reused) but code present -> proceed
        return
      }
    }
    if (Date.now() - start > timeoutMs) throw new Error('timeout waiting for contract code or confirmations')
    await new Promise(r => setTimeout(r, 5000))
  }
}

// verify with retries and exponential backoff; ignores "already verified" errors
async function verifyWithRetries(address, args, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      await hre.run('verify:verify', { address, constructorArguments: args })
      console.log('verification succeeded')
      return
    } catch (e) {
      const msg = e && e.message ? e.message : String(e)
      if (msg.toLowerCase().includes('already verified') || msg.toLowerCase().includes('already verified')) {
        console.log('contract already verified')
        return
      }
      const waitMs = Math.min(60000, Math.pow(2, i) * 1000 + 2000)
      console.log(`verify attempt ${i+1} failed: ${msg}. retrying in ${waitMs}ms`)
      await new Promise(r => setTimeout(r, waitMs))
    }
  }
  throw new Error('verification failed after retries')
}

module.exports.tags = ["all", "sourcechain"]