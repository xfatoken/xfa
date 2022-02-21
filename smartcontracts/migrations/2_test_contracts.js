const XFAToken = artifacts.require("./XFAToken.sol");
const XFAVesting = artifacts.require("./XFAVesting.sol");
const ClaimXFAToken = artifacts.require("./ClaimXFAToken.sol");

const BN = web3.utils.BN;
const { promisify } = require('util');

// Returns the time of the last mined block in seconds
async function latest () {
    const block = await web3.eth.getBlock('latest');
    return new BN(block.timestamp);
  }

function advanceBlock () {
    return promisify(web3.currentProvider.send.bind(web3.currentProvider))({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime(),
    });
  }

// Increases ganache time by the passed duration in seconds
async function increase (duration) {
    if (!BN.isBN(duration)) {
      duration = new BN(duration);
    }
  
    if (duration.isNeg()) throw Error(`Cannot increase time by a negative amount (${duration})`);
  
    await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration.toNumber()],
      id: new Date().getTime(),
    });
  
    await advanceBlock();
}

async function increaseTo (target) {
    if (!BN.isBN(target)) {
      target = new BN(target);
    }
  
    const now = (await latest());
  
    if (target.lt(now)) throw Error(`Cannot increase current time (${now}) to a moment in the past (${target})`);
    const diff = target.sub(now);
    return increase(diff);
}


async function doDeploy(deployer, network, accounts) {

    let xfaToken = await XFAToken.deployed();
    console.log('XFAToken deployed:', xfaToken.address);

    let xfaVesting = await XFAVesting.deployed();
    console.log('XFAVesting deployed:', xfaVesting.address);

    let claimXFAToken = await ClaimXFAToken.at('0xAD17224eaec4aFe6dB4794F37C02eC72d4B8dB04');
    console.log('ClaimXFAToken deployed:', claimXFAToken.address);

    let params2 = '0x0000000000000000000000002d0b74df426977ca2a4100e28e21a839c45f29f000000000000000000000000000000000000000000000002086ac351052600000';
    const x = await claimXFAToken.getClaimData(params2);
    console.log(x);
    console.log('funciona');

    let params = web3.eth.abi.encodeParameters(["address", "uint256"],['0xF992823FFEFC5eD457d973f973928440516404B8', web3.utils.toWei('1500000')]);
    let len = (params.length / 2) - 1;
    let paramsLen = web3.utils.asciiToHex(len.toString());
    let signature = await web3.eth.accounts.sign(params, 'WRITE PRIVATEKEY HERE');

    let now = 1645656200;   // 2022/02/24 00:00:00
    for (let i=0; i<365; i++) { // 360 days loop
        console.log('Test datetime: ', new Date(now * 1000).toISOString());
        await increaseTo(now);
        try {
            await claimXFAToken.claimTokens(params, paramsLen, signature.signature, { from: accounts[1] });
            let tokensClaimed = await claimXFAToken.getUserClaimedTokens(accounts[1]);
            console.log('Tokens Claimed: ', web3.utils.fromWei(tokensClaimed.toString(),'ether'));
        } catch(e) {
            //console.log('ERROR: ', e.toString());
        }

        now += 86400;
    }

}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
};