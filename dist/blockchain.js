"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChain = void 0;
const js_sha256_1 = require("js-sha256");
const transaction_1 = require("./transaction");
const block_1 = require("./block");
const balance_1 = require("./balance");
const config_1 = require("./config");
/**
 * @classdesc - This class contains all the elements of a complete blockchain
 * @class BlockChain
 */
class BlockChain {
    /**
     * @description - This constructor initializes the blockchain.  Currently the blockchain is not persisted.
     * @constructor
     */
    constructor() {
        /**
         * @description - all the blocks in the blockchain
         */
        this.blockchain = [];
        /**
         * @description - the configuration object for this node/blockchain
         */
        this.config = new config_1.Config();
        /**
         * @description - the current difficulty
         */
        this.difficulty = this.config.startDifficulty;
        /**
         * @description - the cumalative difficulty
         */
        this.cumulativeDifficulty = this.difficulty;
        /**
         * @description - a map fo the mining jobs keyed on the (miner address?)
         */
        this.miningJobs = new Map();
        /**
         * @description - transactions array to be assigned to the next block to be mined.
         */
        this.transactionsPool = [];
        if (this.blockchain.length === 0) {
            let transaction = new transaction_1.Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 1000000000000;
            transaction.confirmationCount = 1;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            let signature = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            // let json: string = JSON.stringify(transaction);
            // let hash: string = sha256(json)
            // transaction.transactionDataHash = hash;
            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            let transactions = [];
            transactions.push(transaction);
            transaction = new transaction_1.Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 5000020;
            transaction.confirmationCount = 6;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            signature = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            // json = JSON.stringify(transaction);
            // hash = sha256(json)
            // transaction.transactionDataHash = hash;
            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            //let transactions: Transaction[] = [];
            transactions.push(transaction);
            transaction = new transaction_1.Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 5000040;
            transaction.confirmationCount = 0;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            signature = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            // json = JSON.stringify(transaction);
            // hash = sha256(json)
            // transaction.transactionDataHash = hash;
            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            //let transactions: Transaction[] = [];
            transactions.push(transaction);
            this.genesisBlock = new block_1.Block(0, '0000000000000000000000000000000000000000000000000000000000000000', new Date().getTime(), transactions, 0, 0);
            this.genesisBlock.blockDataHash = this.calcBlockDataHash(this.genesisBlock);
            /**
             * hash the genesis block
             */
            // json = JSON.stringify(this.genesisBlock);
            // hash = sha256(json);
            // this.genesisBlock.blockHash = hash;
            this.genesisBlock.blockHash = this.calcBlockHash(this.genesisBlock);
            this.blockchain.push(this.genesisBlock);
            //this.chainId = this.config.chainId;
            this.chainId = this.genesisBlock.blockHash;
        }
    }
    ;
    /**
     * @description - calculate the transaction data hash
     * @param {Transaction} trans
     * @returns {string} hash
     */
    calcTransactionDataHash(trans) {
        let _unHashedString = "";
        _unHashedString += trans.from +
            trans.to +
            trans.value +
            trans.dateCreated +
            trans.data +
            trans.senderPubKey;
        let json = JSON.stringify(_unHashedString);
        let hash = js_sha256_1.sha256(json);
        return hash;
    }
    /**
     * @description - calculate the block hash
     * @param {block} block
     * @return {string} hash
     */
    calcBlockHash(block) {
        // TODDO: I am not sure how this supposed to be hashed.
        let json = JSON.stringify(block);
        let hash = js_sha256_1.sha256(json);
        return hash;
    }
    /**
     * @description - calculate the block data hash.
     * @param {block} block
     * @return {string} hash
     */
    calcBlockDataHash(block) {
        let _unHashedString = "";
        _unHashedString += block.index;
        let _trans = block.transactions;
        for (let i = 0; i < _trans.length; i++) {
            _unHashedString += _trans[i].from +
                _trans[i].to +
                _trans[i].value +
                _trans[i].fee +
                _trans[i].dateCreated +
                _trans[i].data +
                _trans[i].senderPubKey +
                _trans[i].transactionDataHash +
                _trans[i].senderSignature +
                _trans[i].minedInBlockIndex +
                _trans[i].transactionDataHash;
        }
        _unHashedString += block.difficulty +
            block.previousBlockHash +
            block.minedBy;
        let json = JSON.stringify(_unHashedString);
        let hash = js_sha256_1.sha256(json);
        return hash;
    }
    /**
     * @description - get balances
     * @returns {any[]} balances
     */
    getBalances() {
        let rval = [];
        /**
         * First let's get the confirmed balances
         */
        //let mytrans: Transaction[] = this.getConfirmedTransactions();
        let mytrans = this.getAllTransactions();
        if (mytrans.length === 0) {
            return null;
        }
        /**
         * Create Map to prevent duplicates of addressess and set the values to 0
         */
        let addressmap = new Map();
        for (let i = 0; i < mytrans.length; i++) {
            addressmap.set(mytrans[i].from, 0);
        }
        /**
         * Loop through the transactions array and set the correct values in the map
         */
        for (let i = 0; i < mytrans.length; i++) {
            let _value = addressmap.get(mytrans[i].from);
            _value += mytrans[i].value - mytrans[i].fee;
            addressmap.set(mytrans[i].from, _value);
        }
        /**
         * Now push the unique results from the address map to result array rval.
         */
        for (let accountAddress of addressmap.keys()) {
            let balance = addressmap.get(accountAddress);
            rval.push({ accountAddress, balance });
        }
        return rval;
    }
    /**
     * @description - get all the transactions in all blocks
     */
    getAllTransactions() {
        let rTrans = [];
        /**
         * Get all the transactions in all the blocks.
         */
        for (let i = 0; i < this.blockchain.length; i++) {
            let _trans = this.blockchain[i].transactions;
            rTrans = rTrans.concat(_trans);
        }
        // /**
        //  * Now concat these transactions with the pending ones.
        //  */
        // rTrans = rTrans.concat(this.getPendingTransactions());
        return rTrans;
    }
    /**
     * @description - get the transactions by the transactionDataHash
     * @returns {Transaction[]} transactions
     */
    getTransactionsByTxHash(txHash) {
        let rVal = [];
        let _aTrans = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].transactionDataHash === txHash) {
                rVal.push(_aTrans[i]);
            }
        }
        return rVal;
    }
    /**
     * @description - get the pending transactions for this blockchain
     * @returns {Transaction[]} pendingTransaction
     */
    getPendingTransactions() {
        let rVal = [];
        // for (let i = 0; i < this.blockchain.length; i++) {
        //     let _trans: Transaction[] = this.blockchain[i].transactions;
        //     for (let j=0; j < _trans.length; j++ ) {
        //         if(_trans[j].confirmationCount === 0 ) {
        //             rVal.push(_trans[j]);
        //         }
        //     }
        // }
        let _aTrans = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].confirmationCount == 0) {
                rVal.push(_aTrans[i]);
            }
        }
        return rVal;
    }
    /**
     * @description - get the confirmed transactions
     * @returns {Transaction[]} confirmedTransactions
     */
    getConfirmedTransactions() {
        let rVal = [];
        let _aTrans = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].tranferSuccessful === true && _aTrans[i].confirmationCount >= 1) {
                rVal.push(_aTrans[i]);
            }
        }
        return rVal;
    }
    /**
     * @description - get the confirmed transactons count
     * @returns {number} count
     */
    getConfirmedTransactionsCount() {
        let rVal = this.getConfirmedTransactions().length;
        return rVal;
    }
    /**
     * @description - get the pending transactions count
     * @returns {number} count
     */
    getPendingTransactionsCount() {
        let rVal = this.getPendingTransactions().length;
        return rVal;
    }
    /**
     * @description - get the genesis block
     * @returns {Block} genesisBlock
     */
    getGenesisBlock() {
        return this.genesisBlock;
    }
    /**
     * @description - get the chain id
     * @returns {string} chainId
     */
    getChainId() {
        return this.chainId;
    }
    /**
     * @description - get the block chain
     * @returns {Block[]} blockchain
     */
    getBlockchain() {
        return this.blockchain;
    }
    /**
     * @description - get the count of blocks
     * @returns {number} length
     */
    getBlocksCount() {
        return this.blockchain.length;
    }
    /**
     * @description - handle received transaction
     * @param {Transaction} transaction
     */
    handleReceivedTransaction(transaction) {
        transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
        this.transactionsPool.push(transaction);
    }
    /**
     * @description - get the latest block in the blockchain
     * @returns {Block} latestBlock
     */
    getLatestBlock() {
        let latestBlock = this.getBlockchain()[this.getBlockchain().length - 1];
        return latestBlock;
    }
    /**
     * @description - get the array of pending transactions
     * @returns {Transaction[]} transactions
     */
    getTransactionPool() {
        let rVal = this.transactionsPool;
        return rVal;
    }
    /**
     * @description - get all the transctions for the from address.
     * @param {string} fromAddress
     */
    getTransactions(fromAddress) {
        let rVal = [];
        let _aTrans = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].from === fromAddress) {
                rVal.push(_aTrans[i]);
            }
        }
        return rVal;
    }
    /**
     * @description - check to see if the block structure is valid
     * @param latestBlockReceived
     * @returns {boolean}
     */
    isValidBlockStructure(latestBlockReceived) {
        let rVal = false;
        rVal = typeof latestBlockReceived.blockDataHash === 'string'
            && typeof latestBlockReceived.blockHash === 'string'
            && typeof latestBlockReceived.difficulty === 'number'
            && typeof latestBlockReceived.index === 'number'
            && typeof latestBlockReceived.minedBy === 'string'
            && typeof latestBlockReceived.nonce === 'number'
            && typeof latestBlockReceived.timestamp === 'number'
            && typeof latestBlockReceived.transactions === 'object';
        return rVal;
    }
    /**
     * @description - add the given block to the blockchain
     * @param {Block} latestBlockReceived
     * @returns {booean}
     */
    addBlockToChain(latestBlockReceived) {
        return true;
    }
    /**
     * @description - replace the current blockchain with the given blockchain
     * @param {Block[]} receivedBlocks
     */
    replaceChain(receivedBlocks) {
    }
    /**
     * @description - get the current difficulty
     * @returns {number} current difficulty
     */
    getCurrentDifficulty() {
        return this.difficulty;
    }
    /**
     * @description - get the cumulative difficulty
     * @returns {number} cumulative difficulty
     */
    getCumulativeDifficulty() {
        return this.cumulativeDifficulty;
    }
    /**
     * @description - get the account balances for the given account address
     * @param {string} address
     * @returns {Balance} balance
     */
    // TODO: Take a look at the genesis transaction
    getAccountBalance(address) {
        let balance = new balance_1.Balance();
        // TODO: calculate the balances for this account.
        balance.accountAddress = address;
        let myTrans = this.getTransactions(address);
        if (myTrans === undefined) {
            return null;
        }
        let confirmedSum = 0;
        let confirmedOneSum = 0;
        let pendingSum = 0;
        for (let i = 0; i < myTrans.length; i++) {
            if (myTrans[i].tranferSuccessful === true) {
                if (myTrans[i].confirmationCount >= 1 && myTrans[i].confirmationCount < 6) {
                    if (myTrans[i].from === address) {
                        confirmedOneSum += myTrans[i].value - myTrans[i].fee;
                    }
                    else {
                        confirmedOneSum -= myTrans[i].value;
                    }
                }
                else if (myTrans[i].confirmationCount >= 6) {
                    if (myTrans[i].from === address) {
                        confirmedSum += myTrans[i].value - myTrans[i].fee;
                    }
                    else {
                        confirmedSum -= myTrans[i].value;
                    }
                }
                else {
                    if (myTrans[i].from === address) {
                        pendingSum += myTrans[i].value - myTrans[i].fee;
                    }
                    else {
                        pendingSum -= myTrans[i].value;
                    }
                }
            }
        }
        balance.confirmedBalance = confirmedOneSum;
        balance.safeBalance = confirmedSum;
        balance.pendingBalance = pendingSum;
        return balance;
    }
}
exports.BlockChain = BlockChain;
//# sourceMappingURL=blockchain.js.map