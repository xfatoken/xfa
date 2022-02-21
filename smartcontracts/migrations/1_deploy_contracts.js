const XFAToken = artifacts.require("./XFAToken.sol");
const XFAVesting = artifacts.require("./XFAVesting.sol");
const ClaimXFAToken = artifacts.require("./ClaimXFAToken.sol");

async function doDeploy(deployer, network, accounts) {

    //let listingDate = 1645657200;   // 2022/02/24 00:00:00
    let listingDate = 1644966000;   // 2022/02/16 00:00:00

    await deployer.deploy(XFAToken);
    let xfaToken = await XFAToken.deployed();
    console.log('XFAToken deployed:', xfaToken.address);

    await deployer.deploy(XFAVesting, xfaToken.address, listingDate);
    let xfaVesting = await XFAVesting.deployed();
    console.log('XFAVesting deployed:', xfaVesting.address);

    await deployer.deploy(ClaimXFAToken, xfaToken.address, accounts[0] ,listingDate);
    let claimXFAToken = await ClaimXFAToken.deployed();
    console.log('ClaimXFAToken deployed:', claimXFAToken.address);

    await xfaToken.transfer(claimXFAToken.address, web3.utils.toWei('50000000'));
    console.log('ClaimXFAToken funded with 50.000.000 tokens');

    await xfaToken.transfer(xfaVesting.address, web3.utils.toWei('345000000'));
    console.log('Vesting fund with 345.000.000 tokens');
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
};