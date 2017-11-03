"use strict";

/**
 * @param {!object} contract. Contract to check.
 * @param {!array} functions. What to check.
 */
module.exports = function disallowPausedKilledActions(_web3) {
    const web3 = _web3;

    return function(functions, contract, owner, gas) {
        describe("Paused contract", () => {
            beforeEach("should pause the contract", () => {
                return contract.setPaused(true, { from: owner });
            });

            runContractFunctions(functions, "on a paused contract", gas);
        });

        describe("Paused and Killed contract", () => {
            beforeEach("should pause the contract", () => {
                return contract.setPaused(true, { from: owner });
            });

            beforeEach("should kill the contract", () => {
                return contract.kill({ from: owner });
            });

            runContractFunctions(functions, "on a killed contract", gas);
        });

        function runContractFunctions(functions, state, gas) {
            for (let functionCount = 0; functionCount < functions.length; functionCount++) {
                it('should not allow '+functions[functionCount][0]+" "+state, () => {
                    return web3.eth.expectedExceptionPromise(functions[functionCount][1], gasToUse);
                });
            }
        }
    }
}

