require("dotenv").config();

const ico2Abi = require("./contracts/abis/XifraICO2.json");
const ico3Abi = require("./contracts/abis/XifraICO3.json");

const Web3 = require("web3");
let web3 = null;

const fs = require('fs');

const handleEventBuy = async (event) => {
    const privateKey = process.env.PRIVATE_KEY;
    const { _buyer, _tokens, _paymentAmount, _tokenPayment } = event.returnValues;

    //console.log(`Data received from onTokensBought event, ${_buyer}, ${_tokens}, ${_paymentAmount}, ${_tokenPayment}`);

    const parameters = await web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [_buyer, _tokens]
    );

    const signature = await web3.eth.accounts.sign(parameters, privateKey);

    const insertSql = `INSERT INTO Users (account, amount, signedMessage, signature, createdAt, updatedAt) VALUES ('${_buyer}',${web3.utils.fromWei(_tokens,'ether')},'${parameters}','${signature.signature}', null, null);`;
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
    const privateKey = process.env.PRIVATE_KEY;
    web3 = new Web3(rpcUrl);

    fs.readFile("./to_regenerate.txt", 'utf8', async(err, data) => {
        let dataArray = data.split(/\r?\n/);
        for (let i=0;i<dataArray.length;i++) {
            let record = dataArray[i];
            let splitted = record.split(";");
            const parameters = await web3.eth.abi.encodeParameters(
                ["address", "uint256"],
                [splitted[0], web3.utils.toWei(splitted[1])]
            );
            const signature = await web3.eth.accounts.sign(parameters, privateKey);
        
            const insertSql = `INSERT INTO Users (account, amount, signedMessage, signature, createdAt, updatedAt) VALUES ('${splitted[0]}',${splitted[1]},'${parameters}','${signature.signature}', null, null);`;
            console.log(insertSql);
        }
    });
}

(async () => {
    try {
        await generateInserts();
    } catch (e) {
        console.log('Error main catch', e.toString());
    }
})();