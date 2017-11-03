"use strict";

/**
 * @param {!string} str. String to operate on.
 * @param {!int} packLength. Length to pack
 */
module.exports = function toHexPacked(str, packLength) {
    return this.toHex(str).padEnd(packLength, "0");
}