pragma solidity 0.4.18;

import "./Killable.sol";

// DO NOT use this Contract in production
contract UnsafeKillable is Killable {
    function () public payable {}
}