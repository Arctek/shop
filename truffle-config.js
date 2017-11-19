require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    }
  },
  //contracts_build_directory: "./src/contracts",
  /*,
  mocha: {
    reporter: 'eth-gas-reporter'
  }*/
};
