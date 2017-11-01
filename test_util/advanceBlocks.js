/**
 * @param {Object} contract.
 * @param {Number} blocksToMine.
 */
module.exports = async function(from, to, blocksToMine) {
    for (let i = 0; i < blocksToMine; i++) {
        console.log("Block " + i)
        await web3.eth.sendTransactionPromise({ from: from, to: to, value: 0 });
        
    }
};