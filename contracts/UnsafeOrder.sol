pragma solidity 0.4.15;

import "./Order.sol";

/* DO NOT USE IN PRODUCTUCTION, only for tests */
contract UnsafeOrder is Order {

    function UnsafeOrder(Shop _shop) Order(_shop) {}

    function setStatus(OrderStatus _status) 
        public
        returns(bool success)
    {
        status = _status;
        return true;
    }

    function setTotal(uint _total) 
        public
        returns(bool success)
    {
        total = _total;
        return true;
    }
}