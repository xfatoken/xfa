require("dotenv").config();

const ico2Abi = require("./contracts/abis/XifraICO2.json");
const ico3Abi = require("./contracts/abis/XifraICO3.json");

const Web3 = require("web3");
let web3 = null;

const handleEventBuy = async (event) => {
    const privateKey = process.env.PRIVATE_KEY;
    const { _buyer, _tokens, _paymentAmount, _tokenPayment } = event.returnValues;

    //console.log(`Data received from onTokensBought event, ${_buyer}, ${_tokens}, ${_paymentAmount}, ${_tokenPayment}`);

    const parameters = await web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [_buyer, _tokens]
    );

    const signature = await web3.eth.accounts.sign(parameters, privateKey);

    const insertSql = `INSERT INTO Users (account, amount, signedMessage, signature) VALUES ('${_buyer}',${web3.utils.fromWei(_tokens,'ether')},'${parameters}','${signature.signature}');`;
    console.log(insertSql);
}

const generateInsertManual = async (_address, _amount) => {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    web3 = new Web3(rpcUrl);

    const parameters = await web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [_address, web3.utils.toWei(_amount.toString())]
    );
    const signature = await web3.eth.accounts.sign(parameters, privateKey);

    const insertSql = `INSERT INTO Users (account, amount, signedMessage, signature, createdAt, updatedAt) VALUES ('${_address}',${_amount},'${parameters}','${signature.signature}', '', '');`;
    console.log(insertSql);
}

const generateInserts = async () => {
    const rpcUrl = process.env.RPC_URL;
    web3 = new Web3(rpcUrl);
    const ico2Contract = new web3.eth.Contract(ico2Abi, '0x7488451Db91DF618759b8Af15e36F70c0FDD529E');
    //const ico3Contract = new web3.eth.Contract(ico3Abi, '0x7488451Db91DF618759b8Af15e36F70c0FDD529E');
    const blockNumber = await web3.eth.getBlockNumber();

    const buyEvents = await ico2Contract.getPastEvents(
        'onTokensBought',
        { fromBlock: blockNumber - 1000000, toBlock: blockNumber },
        (error, events) => {
        }
    );

    for (let index = 0; index < buyEvents.length; index++) {
        await handleEventBuy(buyEvents[index]);
    }
}

(async () => {
    try {
        //await generateInserts();
        await generateInsertManual('0x9682d6164D50ed3fc078b474d0fA214190C9DE37', 600);
    } catch (e) {
        console.log('Error main catch', e.toString());
    }
})();