"use strict";

/**
 * @param {!Function.<!Promise>} actionPromise.
 * @param {!Number | !string | !BigNumber} gasToUse.
 * @param {Number} timeOut.
 * @returns {!Promise} which throws unless it hit a valid error.
 */
module.exports = function expectedExceptionPromise(actionPromise, gasToUse, timeOut) {
    const self = this;
    timeOut = timeOut ? timeOut : 5000;

    return actionPromise()
        .then(function(txObject) {
            if (typeof txObject === "string") {
                return self.getTransactionReceiptMined(txObject);
            } else if (typeof txObject.receipt === "object") {
                return txObject.receipt;
            }
            console.log(txObject);
            throw new Error("Invalid object", txObject);
        })
        .then(function(receipt) {
            // We are in Geth
            // Check if the status field is present, post byzantine hardfork, this will be 0x0 if the transaction failed and potentially return all gas
            if (receipt.hasOwnProperty("status")) {
                assert.equal(receipt.status, 0, "should have a failed status");
            }
            else {
                // pre byzantine
                assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
            }
        })
        .catch(function(e) {
            
            if (e.message.indexOf("invalid opcode") > -1 ||
                e.message.indexOf("invalid JUMP") > -1 ||
                e.message.indexOf("out of gas") > -1 ||
                e.message.indexOf("VM Exception") > -1) {
                // We are in TestRPC / Ganache
            } else if (e.message.indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
};