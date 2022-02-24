const XifraICO3 = artifacts.require("./XifraICO3.sol");

async function doDeploy(deployer, network, accounts) {

    let xifraICO3 = await XifraICO3.at('0x3C532E1ae3AfCa2E5E263e1C852cF38522c737c4');
    console.log('XifraICO3 deployed:', xifraICO3.address);

    const tx = await xifraICO3.withdrawETH();
    console.log(tx);

    console.log('Withdraw finished');
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
};