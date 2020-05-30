// import { sha256, sha224 } from 'js-sha256';
//import sha256 from 'crypto-js/sha256';
import * as CryptoJS from 'crypto-js';
import { Transaction } from './transaction';
import { Block } from './models/block';
import { Balance } from './models/balance';
import { Config } from './config';
import { ValidationMessage } from './validation-message';

/**
 * @classdesc - This class contains all the elements of a complete blockchain
 * @class BlockChain
 */
export class BlockChain {
    /**
     * @description - all the blocks in the blockchain
     */
    private blockchain: Block[] = [];
    /**
     * @description - the genesis block.
     */
    private genesisBlock: Block;
    /**
     * @description - the block chain id
     */
    private chainId: string;
    /**
     * @description - the configuration object for this node/blockchain
     */
    private config: Config = new Config();
    /**
     * @description - the current difficulty
     */
    private difficulty: number = this.config.startDifficulty;;
    /**
     * @description - the cumalative difficulty
     */
    private cumulativeDifficulty: number = this.difficulty;
    /**
     * @description - a map fo the mining jobs keyed on the (blockDataHash)
     */
    private miningJobs: Map<string, Block> = new Map<string, Block>();

    /**
     * @description - transactions array to be assigned to the next block to be mined.
     */
    private transactionsPool: Transaction[] = [];

    /**
     * @description - map of mining requests with a key of blockDataHash -> Block.
     */
    private miningRequestsMap: Map<string, Block> = new Map<string, Block>();

    /**
     * @description - This constructor initializes the blockchain.  Currently the blockchain is not persisted.
     * @constructor
     */
    constructor() {
        if (this.blockchain.length === 0) {
            let transaction = new Transaction();
            /**
             * Generate 3 genesis transactions for the genesis block.
             */
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 1000000000000;
            transaction.confirmationCount = this.config.confirmCount;
            let signature: string = "0000000000000000000000000000000000000000000000000000000000000000";
            let senderPubKey: string = "00000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderPubKey = senderPubKey;
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;

            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            let transactions: Transaction[] = [];
            transactions.push(transaction);

            transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 5000020;
            transaction.confirmationCount = this.config.safeConfirmCount;
            transaction.senderPubKey = senderPubKey;
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;

            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            transactions.push(transaction);

            transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = 5000040;
            transaction.confirmationCount = 0;
            transaction.senderPubKey = senderPubKey;
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;

            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            transactions.push(transaction);
            this.genesisBlock = new Block();
            this.genesisBlock.index = 0;
            this.genesisBlock.timestamp = new Date().getTime();
            this.genesisBlock.transactions = transactions;
            this.genesisBlock.difficulty = 0;
            this.genesisBlock.nonce = 0;
            this.genesisBlock.blockDataHash = this.calcBlockDataHash(this.genesisBlock);
            /**
             * hash the genesis block
             */
            this.genesisBlock.blockHash = this.calcGenesisBlockHash(this.genesisBlock);
            this.blockchain.push(this.genesisBlock);
            /**
             * Set the chainId
             */
            this.chainId = this.genesisBlock.blockHash;
        }
    }


    /**
     * @description - creates a new block for the miner.
     * @param {string} minerAddress - address of the miner
     * @returns {Block} - new miner block
     */
    public createCandidateMinerBlock(minerAddress: string): Block {
        let block: Block = new Block();
        block.index = this.getLatestBlock().index + 1;
        block.timestamp = this.getCurrentTimestamp();
        block.transactions = this.createCoinbaseRewardTransaction(minerAddress);
        block.transactions = block.transactions.concat(this.getTransactionPool());
        block.difficulty = this.getCurrentDifficulty();
        block.reward = this.config.blockReward;
        block.rewardAddress = minerAddress;
        block.minedBy = minerAddress;
        block.previousBlockHash = this.getLatestBlock().blockHash;
        block.nonce = 0;
        block.blockDataHash = this.calcBlockDataHash(block);
        return block
    }

    /**
     * @description - create a coinbase reward transaction for the miner.
     * @param {string} minerAddress - miner address
     * @returns {Transaction[]} - an array of 1 transaction
     */
    public createCoinbaseRewardTransaction(minerAddress: string): Transaction[] {
        let rVal: Transaction[] = [];
        let _trans: Transaction = new Transaction();
        _trans.from = this.config.nullAddress;
        _trans.to = minerAddress;
        _trans.value = this.config.blockReward;
        _trans.fee = 0;
        _trans.data = 'coinbase tx';
        _trans.senderPubKey = this.config.nullPubKey;
        _trans.senderSignature = _trans.senderSignature.concat(this.config.nullSignature);
        _trans.minedInBlockIndex = this.getLatestBlock().index + 1;
        _trans.tranferSuccessful = false;
        rVal.push(_trans);
        return rVal;
    }

    /**
     * @description - get the miningRequestMap
     * @returns {Map<string,Block>} miniingRequestMap
     */
    public getMiningRequestMap(): Map<string, Block> {
        return this.miningRequestsMap;
    }

    /**
     * @description - purge mining request map
     */
    public purgeMiningRequestMap() {
        for (let _blockDataHash of this.miningRequestsMap.keys()) {
            this.miningRequestsMap.delete(_blockDataHash);
        }
    }

    /**
     * @description - calculate the transaction data hash 
     * @param {Transaction} trans 
     * @returns {string} hash
     */
    public calcTransactionDataHash(trans: Transaction): string {
        let _unHashedString: string = "";
        _unHashedString += trans.from +
            trans.to +
            trans.value +
            trans.fee +
            trans.dateCreated +
            trans.data +
            trans.senderPubKey;
        let json: string = JSON.stringify(_unHashedString);
        let hash: string = CryptoJS.SHA256(json).toString();
        return hash;
    }

    /**
     * @description - calculate the genesis block hash
     * @param {block} block 
     * @return {string} hash
     */
    private calcGenesisBlockHash(block: Block): string {
        let json: string = JSON.stringify(block);
        let hash: string = CryptoJS.SHA256(json).toString();
        return hash;
    }

    /**
     * @description - calculate the block data hash.
     * @param {block} block 
     * @return {string} hash
     */
    public calcBlockDataHash(block: Block): string {
        let _tBlock: Block = new Block();
        _tBlock.index = block.index;
        _tBlock.transactions = block.transactions;
        _tBlock.difficulty = block.difficulty;
        _tBlock.previousBlockHash = block.previousBlockHash;
        _tBlock.minedBy = block.minedBy;
        let json: string = JSON.stringify(_tBlock);
        let hash: string = CryptoJS.SHA256(json).toString();
        return hash;
    }
    // /**
    //  * @description - calculate the block data hash.
    //  * @param {block} block 
    //  * @return {string} hash
    //  */
    // public calcBlockDataHash(block: Block): string {
    //     let _unHashedString: string = "";
    //     _unHashedString += block.index;
    //     let _trans: Transaction[] = block.transactions;
    //     for (let i = 0; i < _trans.length; i++) {
    //         _unHashedString += _trans[i].from +
    //             _trans[i].to +
    //             _trans[i].value +
    //             _trans[i].fee +
    //             _trans[i].dateCreated +
    //             _trans[i].data +
    //             _trans[i].senderPubKey +
    //             _trans[i].transactionDataHash +
    //             _trans[i].senderSignature +
    //             _trans[i].minedInBlockIndex;
    //     }
    //     _unHashedString += block.difficulty +
    //         block.previousBlockHash +
    //         block.minedBy;
    //     let json: string = JSON.stringify(_unHashedString);
    //     let hash: string = sha256(json)
    //     return hash;
    // }

    /**
     * @description - This code validate the new block against the previous one.  The idea is to see if the latest block in the change is truly the
     *                  previous block and that the hash for the new block is correct.
     *                  This code and the supporting methods were taken from https://github.com/lhartikk/naivecoin/blob/chapter5/src/blockchain.ts
     * @param {Block} newBlock - the newly mined block
     * @param {Block} previousBlock - the pevious block
     * @returns true or false.
     */
    public isValidNewBlock(newBlock: Block, previousBlock: Block): boolean {
        if (!this.isValidBlockStructure(newBlock)) {
            console.log('invalid block structure: %s', JSON.stringify(newBlock));
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.blockHash !== newBlock.previousBlockHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!this.isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        } else if (!this.hasValidHash(newBlock)) {
            return false;
        }
        return true;
    }

    /**
     * @description - this does a check for a valid timestamp that I don't understand.
     * @param {Block} newBlock - the newly mined block
     * @param {Block} previousBlock - the previous block maybe. 
     * @returns true or false
     */
    public isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
        return true;
        return ( previousBlock.timestamp - 60 < newBlock.timestamp )
            && newBlock.timestamp - 60 < this.getCurrentTimestamp();
    }

    /**
     * @description - gets the current time in seconds since the unix epoch.
     * @returns {number} seconds.
     */
    public getCurrentTimestamp(): number { 
        return Math.round(new Date().getTime() / 1000);
    }
    
    /**
     * @description - validates the blockHash of the block
     * @param block - newly created block to be validated.
     * @returns true or false
     */
    public hasValidHash(block: Block): boolean {
    
        if (!this.hashMatchesBlockContent(block)) {
            console.log('invalid hash, got:' + block.blockHash);
            return false;
        }
    
        if (!this.hashMatchesDifficulty(block.blockHash, block.difficulty)) {
            console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.blockHash);
        }
        return true;
    }

    /**
     * @description - validates the block's blockHash
     * @param {Block} block - block to validate for the hash
     * @returns true or false
     */
    public hashMatchesBlockContent(block: Block): boolean {
        const blockHash: string = this.calculateHashForBlock(block);
        return blockHash === block.blockHash;
    }

    /**
     * @description - calculate the blockHash for the given block. 
     * @param {Block} block 
     * @returns {string} hash value
     */
    public calculateHashForBlock(block: Block): string {
        let _hash: string = CryptoJS.SHA256(
            block.index + 
            block.previousBlockHash + 
            block.timestamp + 
            block.transactions +
            block.difficulty + 
            block.nonce).toString();
        console.log('BlockChain.calculateHashForBlock(): _hash=',_hash);
        return _hash;
    }
    
    /**
     * @description - checks to see if the hash has been calculated with the correct difficulty.
     * @param {string} hash - hash for which the difficulty is checked
     * @param {number} difficulty - the difficulty to compare
     * @returns true or false
     */
    public hashMatchesDifficulty(hash: string, difficulty: number): boolean {
        //const hashInBinary: string = hexToBinary(hash);
        const requiredPrefix: string = '0'.repeat(difficulty);
        return hash.startsWith(requiredPrefix);
    }
    /**
     * @description - get balances
     * @returns {any[]} balances
     */
    public getBalances(): any[] {
        let rval: any[] = [];

        /**
         * First let's get the confirmed balances
         */
        //let mytrans: Transaction[] = this.getConfirmedTransactions();
        let mytrans: Transaction[] = this.getAllTransactions();
        if (mytrans.length === 0) {
            return null;
        }

        /**
         * Create Map to prevent duplicates of addressess and set the values to 0
         */
        let addressmap: Map<string, number> = new Map<string, number>();
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
    public getAllTransactions(): Transaction[] {
        let rTrans: Transaction[] = [];
        /**
         * Get all the transactions in all the blocks.
         */
        for (let i = 0; i < this.blockchain.length; i++) {
            let _trans: Transaction[] = this.blockchain[i].transactions;
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
    public getTransactionsByTxHash(txHash: string): Transaction[] {
        let rVal: Transaction[] = [];
        let _aTrans: Transaction[] = this.getAllTransactions();
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
    public getPendingTransactions(): Transaction[] {
        let rVal: Transaction[] = [];
        // for (let i = 0; i < this.blockchain.length; i++) {
        //     let _trans: Transaction[] = this.blockchain[i].transactions;
        //     for (let j=0; j < _trans.length; j++ ) {
        //         if(_trans[j].confirmationCount === 0 ) {
        //             rVal.push(_trans[j]);
        //         }
        //     }
        // }
        let _aTrans: Transaction[] = this.getAllTransactions();
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
    public getConfirmedTransactions(): Transaction[] {
        let rVal: Transaction[] = [];
        let _aTrans: Transaction[] = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].tranferSuccessful === true && _aTrans[i].confirmationCount >= this.config.confirmCount) {
                rVal.push(_aTrans[i]);
            }
        }
        return rVal;
    }

    /**
     * @description - get the confirmed transactons count
     * @returns {number} count
     */
    public getConfirmedTransactionsCount(): number {
        let rVal: number = this.getConfirmedTransactions().length;
        return rVal;
    }

    /**
     * @description - get the pending transactions count
     * @returns {number} count
     */
    public getPendingTransactionsCount(): number {
        let rVal: number = this.getPendingTransactions().length;
        return rVal;
    }

    /**
     * @description - get the genesis block
     * @returns {Block} genesisBlock
     */
    public getGenesisBlock(): Block {
        return this.genesisBlock;
    }

    /**
     * @description - get the chain id
     * @returns {string} chainId
     */
    public getChainId(): string {
        return this.chainId;
    }

    /**
     * @description - get the block chain
     * @returns {Block[]} blockchain
     */
    public getBlockchain(): Block[] {
        return this.blockchain;
    }

    /**
     * @description - get the count of blocks
     * @returns {number} length
     */
    public getBlocksCount(): number {
        return this.blockchain.length;
    }

    /**
     * @description - handle received transaction.  this is called by the P2P class.
     * @param {Transaction} transaction 
     */
    public handleReceivedTransaction(transaction: Transaction): void {
        //transaction.transactionDataHash = this.calcTransactionDataHash(transaction); // Done on the wallet side, maybe?
        let _message: ValidationMessage = new ValidationMessage();
        _message.message = 'success';
        _message = this.validateReceivedTransaction(transaction);
        if(_message.message === 'success') {
            this.transactionsPool.push(transaction);
        } else {
            console.log(JSON.stringify(_message));
            throw(_message.message);
        }
    }

    private validateTransactionFields(transaction: Transaction): ValidationMessage {
        let rVal: ValidationMessage = new ValidationMessage();
        let structureValid: boolean = true;
        rVal.message = 'success';
        structureValid = typeof transaction.from === 'string'
            && typeof transaction.data === 'string'
            && transaction.dateCreated instanceof Date
            && typeof transaction.fee === 'number'
            && typeof transaction.senderPubKey === 'string'
            && transaction.senderSignature instanceof Array
            && typeof transaction.to === 'string'
            && typeof transaction.value === 'number';
        if (structureValid === false) {
            rVal.message = 'The structure of the transaction is invalid';
        }
        if (transaction.hasOwnProperty('from') === false) {
            rVal.message += ', Missing from field';
        }
        if (transaction.hasOwnProperty('to') === false) {
            rVal.message += ', Missing to field';
        }
        if (transaction.hasOwnProperty('data') === false) {
            rVal.message += ', Missing data field';
        }
        if (transaction.hasOwnProperty('dateCreated') === false) {
            rVal.message += ', Missing dateCreated field';
        }
        if (transaction.hasOwnProperty('fee') === false) {
            rVal.message += ', Missing fee field';
        }
        if (transaction.hasOwnProperty('senderPubKey') === false) {
            rVal.message += ', Missing senderPubKey field';
        }
        if (transaction.hasOwnProperty('senderSignature') === false) {
            rVal.message += ', Missing senderSignature field';
        }
        if (transaction.hasOwnProperty('value') === false) {
            rVal.message += ', Missing value field';
        }

        if (transaction.from === undefined || transaction.from == null) {
            rVal.message += ', Field from does not have a value';
        }
        if (transaction.to === undefined || transaction.to == null) {
            rVal.message += ', Field to does not have a value';
        }
        if (transaction.data === undefined || transaction.data == null) {
            rVal.message += ', Field data does not have a value';
        }
        if (transaction.dateCreated === undefined || transaction.dateCreated == null) {
            rVal.message += ', Field dateCreated does not have a value';
        }
        if (transaction.fee === undefined || transaction.fee == null) {
            rVal.message += ', Field fee does not have a value';
        }
        if (transaction.senderPubKey === undefined || transaction.senderPubKey == null) {
            rVal.message += ', Field senderPubKey does not have a value';
        }
        if (transaction.senderSignature === undefined || transaction.senderSignature == null) {
            rVal.message += ', Field senderSignature does not have a value';
        }
        if (transaction.value === undefined || transaction.value == null) {
            rVal.message += ', Field value does not have a value';
        }
        return rVal;
    }

    public validateReceivedTransaction(transaction: Transaction): { message: string; } {
        /**
         * Send Transactions
            + For each received transaction the Node does the following:
                o Checks for missing / invalid fields / invalid field values
                o Calculates the transaction data hash (unique transaction
                    o Checks for collisions  duplicated transactions are skipped
                o Validates the transaction public key , validates the signature
                o Checks the sender account balance to be >= value + fee
                o Checks whether value >= 0 and fee > 10 (min fee)
                o Puts the transaction in the "pending transactions " pool
                o Sends the transaction to all peer nodes through the REST API
                    o It goes from peer to peer until it reaches the entire network
        */
        let message: ValidationMessage = new ValidationMessage();
        message.message = 'success';
        let validateFields: ValidationMessage = this.validateTransactionFields(transaction);
        if (validateFields.message !== 'success') {
            return validateFields;
        }
        let validateDups: ValidationMessage = new ValidationMessage();
        let _tranactionDataHash: string = this.calcTransactionDataHash(transaction);
        for (let i = 0; i < this.getPendingTransactions().length; i++) {
            if (this.getPendingTransactions()[i].transactionDataHash === _tranactionDataHash) {
                validateDups.message = 'Duplicate tranaction skipped for transactionDataHash=' + transaction.transactionDataHash;
                return validateDups;
            }
        }

        // TODO: Validates the transaction public key , validates the signature

        let rBalance: Balance = this.getAccountBalance(transaction.from);
        if (rBalance.confirmedBalance < transaction.value + transaction.fee) {
            message.message = 'Sender does not have enough funds to complete the transaction';
        }
        if (transaction.value < 0) {
            message.message = 'Transaction value must be greater than or equal to 0';
        }
        if (transaction.fee < 10) {
            message.message = 'Transaction fee is not greater than or equal to 10 micro-coins';
        }
        return message;
    }


    /**
     * @description - get the latest block in the blockchain
     * @returns {Block} latestBlock
     */
    public getLatestBlock(): Block {
        let latestBlock: Block = this.getBlockchain()[this.getBlockchain().length - 1];
        return latestBlock;
    }

    /**
     * @description - get the array of pending transactions
     * @returns {Transaction[]} transactions
     */
    public getTransactionPool(): Transaction[] {
        let rVal: Transaction[] = this.transactionsPool;
        return rVal;
    }

    /**
     * @description - get all the transctions for the from address.
     * @param {string} fromAddress 
     */
    public getTransactions(fromAddress: string): Transaction[] {
        let rVal: Transaction[] = [];
        let _aTrans: Transaction[] = this.getAllTransactions();
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
    public isValidBlockStructure(latestBlockReceived: Block): boolean {
        let rVal: boolean = false;
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
     * @returns {boolean}
     */
    public addBlockToChain(latestBlockReceived: Block): boolean {
        if(latestBlockReceived.index !== this.getLatestBlock().index) {
            this.blockchain.push(latestBlockReceived);
            console.log('BlockChain.addBlockToChain(): added index=', latestBlockReceived.index );
            return true;
        }
        console.log('BlockChain.addBlockToChain(): failed to add index=', latestBlockReceived.index );
        return false;
    }

    /**
     * @description - replace the current blockchain with the given blockchain
     * @param {Block[]} receivedBlocks 
     */
    public replaceChain(receivedBlocks: Block[]): void {

    }

    /**
     * @description - get the current difficulty
     * @returns {number} current difficulty
     */
    public getCurrentDifficulty(): number {
        return this.difficulty;
    }

    /**
     * @description - get the cumulative difficulty
     * @returns {number} cumulative difficulty
     */
    public getCumulativeDifficulty(): number {
        return this.cumulativeDifficulty;
    }

    /**
     * @description - get the account balances for the given account address 
     * @param {string} address 
     * @returns {Balance} balance
     */
    // TODO: Take a look at the genesis transaction
    public getAccountBalance(address: string): Balance {
        let balance: Balance = new Balance();
        // TODO: calculate the balances for this account.
        balance.accountAddress = address;
        let myTrans: Transaction[] = this.getTransactions(address);
        if (myTrans === undefined) {
            return null;
        }
        let confirmedSum: number = 0;
        let confirmedOneSum: number = 0;
        let pendingSum: number = 0;
        for (let i = 0; i < myTrans.length; i++) {
            if (myTrans[i].tranferSuccessful === true) {
                if (myTrans[i].confirmationCount >= this.config.confirmCount && myTrans[i].confirmationCount < this.config.safeConfirmCount) {
                    if (myTrans[i].from === address) {
                        confirmedOneSum += myTrans[i].value - myTrans[i].fee;
                    } else {
                        confirmedOneSum -= myTrans[i].value;
                    }
                } else if (myTrans[i].confirmationCount >= this.config.safeConfirmCount) {
                    if (myTrans[i].from === address) {
                        confirmedSum += myTrans[i].value - myTrans[i].fee;
                    } else {
                        confirmedSum -= myTrans[i].value;
                    }
                } else {
                    if (myTrans[i].from === address) {
                        pendingSum += myTrans[i].value - myTrans[i].fee;
                    } else {
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