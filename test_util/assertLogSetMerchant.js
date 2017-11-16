"use strict";

/**
 * @param {!object} txObject, a transaction object.
 * @param {!string} who. Address to match.
 * @param {!string} merchant. Address to match.
 */
module.exports = function assertLogSetMerchant(txObject, who, merchant) {
    this.equal(txObject.logs.length, 1, "should have received 1 event");
    this.strictEqual(txObject.logs[0].event, "LogSetMerchant", "should have received LogSetMerchant event");
                
    this.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    this.strictEqual(
        txObject.logs[0].args.merchant,
        merchant,
        "should be merchant");
    
    this.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    this.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    this.topicContainsAddress(txObject.receipt.logs[0].topics[2], merchant);
}