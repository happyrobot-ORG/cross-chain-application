const { task } = require("hardhat/config")
const { networkConfig } = require("../helper-hardhat-config")

task("lock-and-cross")
    .addParam("tokenid", "tokenId to be locked and crossed")
    .addOptionalParam("chainselector", "chain selector of destination chain")
    .addOptionalParam("receiver", "receiver in the destination chain")
    .setAction(async(taskArgs, hre) => {
        // get tokenId from parameter
        const tokenId = taskArgs.tokenid

        const { firstAccount } = await getNamedAccounts()
        console.log(`deployer is ${firstAccount}`)

        // get receiver contract 
        // deployed contract will be used if there is no receiver provided
        let destReceiver
        if(taskArgs.receiver) {
            destReceiver = taskArgs.receiver
        } else {
            const nftBurnAndMint = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            destReceiver = nftBurnAndMint.address
        }
        console.log(`NFTPoolBurnAndMint address on destination chain is ${destReceiver}`)

        // get the chain selector of destination chain
        // deployed contract will be used if there is no chain selector provided
        let destChainSelector
        if(taskArgs.chainselector) {
            destChainSelector = taskArgs.chainselector
        } else {
            destChainSelector = networkConfig[network.config.chainId].companionChainSelector
        }
        console.log(`destination chain selector is ${destChainSelector}`)

        const linkTokenAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr)
        const nftPoolLockAndRelease = await ethers
            .getContract("NFTPoolLockAndRelease", firstAccount)
        
        // transfer 10 LINK token from deployer to pool
        const balanceBefore = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        const deployerLinkBalance = await linkToken.balanceOf(firstAccount)
        console.log(`balance before: ${balanceBefore}`)
        console.log(`deployer LINK balance: ${deployerLinkBalance}`)
        const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("10"))
        await transferTx.wait(6)
        const balanceAfter = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        console.log(`balance after: ${balanceAfter}`)

        // approve the pool have the permission to transfer deployer's token
        const nft = await ethers.getContract("MyToken", firstAccount)
        const poolAddress = nftPoolLockAndRelease.target

        try {
            const tokenOwner = await nft.ownerOf(tokenId)
            console.log(`NFT owner of token ${tokenId}: ${tokenOwner}`)
        } catch (error) {
            console.error(`failed to read NFT owner for token ${tokenId}:`, error)
            throw error
        }

        const approvedAddress = await nft.getApproved(tokenId)
        const isApprovedAll = await nft.isApprovedForAll(firstAccount, poolAddress)
        console.log(`NFT approved to: ${approvedAddress}`)
        console.log(`isApprovedForAll for pool: ${isApprovedAll}`)

        const approveTx = await nft.approve(poolAddress, tokenId)
        await approveTx.wait(1)
        console.log(`approve transaction submitted for token ${tokenId} to pool ${poolAddress}`)
        const approvedAfter = await nft.getApproved(tokenId)
        console.log(`NFT approved after tx: ${approvedAfter}`)

        // ccip send
        console.log(`${tokenId}, ${firstAccount}, ${destChainSelector}, ${destReceiver}`)
        let lockAndCrossTx
        try {
            lockAndCrossTx = await nftPoolLockAndRelease.lockAndSendNFT(
                tokenId,
                firstAccount,
                destChainSelector,
                destReceiver
            )
            console.log(`NFT locked and crossed, transaction hash is ${lockAndCrossTx.hash}`)
        } catch (error) {
            console.error("lockAndSendNFT failed:", error)
            throw error
        }
})

module.exports = {}