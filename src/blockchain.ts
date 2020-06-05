//import { sha256, sha224 } from 'js-sha256';
import { ec } from 'elliptic';
import * as CryptoJS from 'crypto-js'
import { Transaction } from './models/transaction';
import { Block } from './models/block';
import { Balance } from './models/balance';
import { Config } from './config';
import { ValidationMessage } from './models/validation-message';
import { P2P } from './p2p';

/**
 * @classdesc - This class contains all the elements of a complete blockchain
 * @class BlockChain
 */
export class BlockChain {
    /**
     * @description - used to verify transaction signatures
     */
    private EC = new ec('secp256k1');
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
    private difficulty: number = this.config.startDifficulty;

    /**
     * @description - p2p service
     */
    private p2p: P2P;
    ;
    // /**
    //  * @description - the cumalative difficulty
    //  */
    // private cumulativeDifficulty: number = this.difficulty;
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
            let signature: string = "0000000000000000000000000000000000000000000000000000000000000000";
            let senderPubKey: string = "00000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderPubKey = senderPubKey;
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.transferSuccessful = true;
            transaction.dateCreated = new Date();

            transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            let transactions: Transaction[] = [];
            transactions.push(transaction);

            // transaction = new Transaction();
            // transaction.data = "genesis tx";
            // transaction.dateCreated = new Date();
            // transaction.fee = 0;
            // transaction.from = this.config.nullAddress;
            // transaction.to = this.config.faucetAddress;
            // transaction.value = 5000020;
            // transaction.confirmationCount = this.config.safeConfirmCount;
            // transaction.senderPubKey = senderPubKey;
            // transaction.senderSignature.push(signature);
            // transaction.senderSignature.push(signature);
            // transaction.minedInBlockIndex = 0;
            // transaction.transferSuccessful = true;

            // transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            // transactions.push(transaction);

            // transaction = new Transaction();
            // transaction.data = "genesis tx";
            // transaction.dateCreated = new Date();
            // transaction.fee = 0;
            // transaction.from = this.config.nullAddress;
            // transaction.to = this.config.faucetAddress;
            // transaction.value = 5000040;
            // transaction.confirmationCount = 0;
            // transaction.senderPubKey = senderPubKey;
            // transaction.senderSignature.push(signature);
            // transaction.senderSignature.push(signature);
            // transaction.minedInBlockIndex = 0;
            // transaction.transferSuccessful = true;

            // transaction.transactionDataHash = this.calcTransactionDataHash(transaction);
            // transactions.push(transaction);
            this.genesisBlock = new Block();
            this.genesisBlock.index = 0;
            this.genesisBlock.timestamp = new Date().getTime();
            this.genesisBlock.transactions = transactions;
            this.genesisBlock.difficulty = 0;
            this.genesisBlock.nonce = 0;
            this.genesisBlock.minedBy = this.config.nullAddress;
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
     * @description - sets the P2P service needed by this class.
     * @param p2p - peer-to-peer service used by this class.
     */
    public setP2PService(p2p: P2P) {
        this.p2p = p2p;
    }

    /**
     * @description - adjust the block mining difficulty
     */
    public adjustMiningDifficulty(): void {
        // I believe the times are in millseconds.
        let _blocks: Block[] = this.getBlockchain();
        let pTime: number = this.getGenesisBlock().timestamp;
        let cTime: number = this.getGenesisBlock().timestamp;
        let sTime: number = 0;
        for (let i = 0; i < _blocks.length; i++) {
            cTime = _blocks[i].timestamp;
            sTime += cTime - pTime;
            pTime = cTime;
        }
        let average: number = sTime / this.getBlocksCount();
        if (average <= this.config.targetBlockTime) {
            this.difficulty++;
        } else if (this.difficulty > 1) {
            this.difficulty--;
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
        block.timestamp = new Date().getTime();
        block.transactions = this.createCoinbaseRewardTransaction(minerAddress);
        block.transactions = block.transactions.concat(this.getTransactionPool());
        // TODO: verify balances and then set transacton.transferComplete = true and set transaction.blockIndex = block.index
        block.transactions = this.verifyTransactions(block, block.transactions);
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
     * @description - verify the transactions for the candidate block.
     * @param {Block} block - candidate block
     * @param {Transaction[]} tranactions - transactions to verify for the block.
     * @returns {Transaction[]} transactions
     */
    private verifyTransactions(block: Block, tranactions: Transaction[]): Transaction[] {
        // TODO Look at balances to see if the transfer can take place. Currently not doing this.
        // This logic needs to be completed.
        for (let i = 0; i < tranactions.length; i++) {
            tranactions[i].transferSuccessful = true;
            tranactions[i].minedInBlockIndex = block.index;
        }
        return tranactions;
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
        _trans.transferSuccessful = false;
        _trans.transactionDataHash = this.calcTransactionDataHash(_trans);
        _trans.senderPubKey = this.config.nullPubKey;
        _trans.senderSignature = this.config.nullSignature;
        _trans.dateCreated = new Date();
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
     * @description - delete the blockDataHash from the mining request map
     * @param _blockDataHash blockDataHash to delete
     */
    public deleteMiningRequest(_blockDataHash: string): void {
        this.miningRequestsMap.delete(_blockDataHash);
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

    /**
     * @description - Check the validity of the newly mined block  The code was take from https://github.com/lhartikk/naivecoin/blob/chapter5/src/blockchain.ts
     * @param newBlock - the newly mined block
     * @param previousBlock - the pevious block
     * @returns {boolean} true or false
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
            // } else if (!this.isValidTimestamp(newBlock, previousBlock)) {
            //     console.log('invalid timestamp');
            //     return false;
        } else if (!this.hasValidHash(newBlock)) {
            return false;
        }
        return true;
    }

    // public isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
    //     return ( previousBlock.timestamp - 60 < newBlock.timestamp )
    //         && newBlock.timestamp - 60 < this.getCurrentTimestamp();
    // }

    /**
     * @description - calculate the current time in seconds since the UNIX EPOC.
     * @returns {number} time in seconds.
     */
    public getCurrentTimestamp(): number {
        return Math.round(new Date().getTime() / 1000);
    }

    /**
     * @description - validates the block hash set by the miner.
     * @param block - candidate block to petentially be added to the chain.
     * @returns {boolean} true or false
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
     * @description - check to see if the calculated hash matches the block.blockHash
     * @param block - block candidate to pentially be added to the block chain.
     * @returns {boolean} - true or false
     */
    public hashMatchesBlockContent(block: Block): boolean {
        const blockHash: string = this.calculateHashForBlock(block);
        return blockHash === block.blockHash;
    }

    /**
     * @description - calculates the blockHash for the given block.
     * @param block - block to be calculated
     * @returns {string} - hash
     */
    public calculateHashForBlock(block: Block): string {
        let _hash: string = CryptoJS.SHA256(
            block.blockDataHash +
            new Date(block.dateCreated).toISOString() +
            block.nonce).toString();
        return _hash;
    }

    /**
     * @description - check to see if the difficulty is correct for the given hash 
     * @param hash - hash to be compared for difficulty
     * @param difficulty - the difficulty
     * @returns {boolean} - true or false
     */
    public hashMatchesDifficulty(hash: string, difficulty: number): boolean {
        //const hashInBinary: string = hexToBinary(hash);
        if (difficulty < this.config.startDifficulty) {
            console.log('BlockChain.hashMatchesDifficulty(): difficulty=' + difficulty + " is not valid");
            return false;
        }
        const requiredPrefix: string = '0'.repeat(difficulty);
        return hash.startsWith(requiredPrefix);
    }

    /**
     * @description - get balances
     * @returns {any[]} balances
     */
    public getBalances(): { [address: string]: number } {
        const mytrans: Transaction[] = this.getAllTransactions();
        if (mytrans.length === 0) {
            return null;
        }

        const balances: { [address: string]: number } = {};

        for (let i = 0; i < mytrans.length; i++) {
            const from = mytrans[i].from;
            const to = mytrans[i].to;
            const value = mytrans[i].value;
            const fee = mytrans[i].fee;

            const fromBalanceBefore = balances[from] || 0;
            const toBalanceBefore = balances[to] || 0;

            const fromBalanceAfter = fromBalanceBefore - value - fee;
            const toBalanceAfter = toBalanceBefore + value;

            balances[from] = fromBalanceAfter;
            balances[to] = toBalanceAfter;
        }

        return balances;
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
     * @description - get the pending transactions from the transaction pool.
     * @returns {Transaction[]} pendingTransaction
     */
    public getPendingTransactions(): Transaction[] {
        return this.transactionsPool;
    }
    // public getPendingTransactions(): Transaction[] {
    //     let rVal: Transaction[] = [];
    //     // for (let i = 0; i < this.blockchain.length; i++) {
    //     //     let _trans: Transaction[] = this.blockchain[i].transactions;
    //     //     for (let j=0; j < _trans.length; j++ ) {
    //     //         if(_trans[j].confirmationCount === 0 ) {
    //     //             rVal.push(_trans[j]);
    //     //         }
    //     //     }
    //     // }
    //     let _aTrans: Transaction[] = this.getAllTransactions();
    //     for (let i = 0; i < _aTrans.length; i++) {
    //         if (_aTrans[i].confirmationCount == 0) {
    //             rVal.push(_aTrans[i]);
    //         }
    //     }

    //     return rVal;
    // }

    /**
     * @description - get the confirmed transactions
     * @returns {Transaction[]} confirmedTransactions
     */
    public getConfirmedTransactions(): Transaction[] {
        let rVal: Transaction[] = [];
        let _aTrans: Transaction[] = this.getAllTransactions();
        for (let i = 0; i < _aTrans.length; i++) {
            if (_aTrans[i].transferSuccessful === true && this.calculateConfirmationCount(_aTrans[i]) >= this.config.confirmCount) {
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
     * @description - checks to see if the given transaction is already in the pool.
     * @param {Transaction} tranaction 
     * @returns {boolean}
     */
    private isTransactionInTransactionPool(tranaction: Transaction): boolean {
        let _trans: Transaction[] = this.getTransactionPool();
        for (let i = 0; _trans.length; i++) {
            if (tranaction.transactionDataHash === _trans[i].transactionDataHash) {
                return true;
            }
        }
        return false;
    }

    /**
     * @description - handle received transaction.  this is called by the P2P class.
     * @param {Transaction} transaction 
     */
    public handleReceivedTransaction(transaction: Transaction): void {
        //transaction.transactionDataHash = this.calcTransactionDataHash(transaction); // Done on the wallet side, maybe?
        let _message: ValidationMessage = new ValidationMessage();
        if (this.isTransactionInTransactionPool(transaction) === true) {
            _message.message = "Transaction already exists in the transaction pool " + transaction.transactionDataHash;
            console.log('BlockChain.handleReceivedTransaction(): ', _message.message);
            throw (_message.message);
        }
        _message.message = 'success';
        _message = this.validateReceivedTransaction(transaction);
        if (_message.message === 'success') {
            this.transactionsPool.push(transaction);
        } else {
            console.log(JSON.stringify(_message));
            throw (_message.message);
        }
    }

    /**
     * @description - validate the given transaction's fields.
     * @param {Transaction} transaction 
     */
    private validateTransactionFields(transaction: Transaction): ValidationMessage {
        let rVal: ValidationMessage = new ValidationMessage();
        let structureValid: boolean = true;
        rVal.message = 'success';
        structureValid = typeof transaction.from === 'string'
            && typeof transaction.data === 'string'
            //&& typeof new Date(transaction.dateCreated).toISOString() === 'string'
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

    /**
     * @description - verify the signature of the given transaction
     * @param {Transaction} transaction 
     */
    private isValidSignature(transaction: Transaction): boolean {
        try {
            let validSig = this.EC.verify(transaction.transactionDataHash, transaction.senderSignature, transaction.senderPubKey);
            return validSig;
        } catch (e) {
            console.log('BlockChain.isValidSignature(): got the exception');
            return false;
        }
    }

    /**
     * @description - validate the given transaction
     * @param {Transaction} transaction 
     * @returns {ValidationMessage} - a message of success if good.
     */
    public validateReceivedTransaction(transaction: Transaction): ValidationMessage {
        /**
         * Send Transactions
            + For each received transaction the Node does the following:
                o Checks for missing / invalid fields / invalid field values
                o Calculates the transaction data hash (unique transaction
                    o Checks for collisions -> duplicated transactions are skipped
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
        let _transactionDataHash: string = this.calcTransactionDataHash(transaction);
        let allTrans: Transaction[] = this.getAllTransactions();
        for (let i = 0; i < allTrans.length; i++) {
            let _ltransactionDataHash: string = allTrans[i].transactionDataHash;
            if (_ltransactionDataHash === _transactionDataHash) {
                console.log('BlockChain.validateReceivedTransactions(): Duplicate tranaction skipped for transactionDataHash=' + transaction.transactionDataHash);
                validateDups.message = 'Duplicate tranaction skipped for transactionDataHash=' + transaction.transactionDataHash;
                return validateDups;
            }
        }

        // TODO: Validates the transaction public key , validates the signature
        if (this.isValidSignature(transaction) === false) {
            message.message = 'Invalid signature for transaction ' + transaction.transactionDataHash + ' contents:' + JSON.stringify(transaction);
            return message;
        }

        let rBalance: Balance = this.getAccountBalance(transaction.from);
        if (rBalance === null) {
            message.message = 'Sender address is invalid';
            return message;
        }
        if (rBalance.confirmedBalance < transaction.value + transaction.fee) {
            message.message = 'Sender does not have enough funds to complete the transaction';
        }
        if (transaction.value < 0) {
            message.message = 'Transaction value must be greater than or equal to 0';
        }
        if (transaction.from !== this.config.nullAddress && transaction.fee < 10) {
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
        if (latestBlockReceived.index !== this.getLatestBlock().index) { // Make sure the new block's index is not the same as the current block height
            // It is not, so attempt to add it to this chain.
            if (this.isValidNewBlock(latestBlockReceived, this.getLatestBlock())) {
                this.processTransactions(latestBlockReceived);
                // if (this.processTransactions(latestBlockReceived) === false) {
                //     console.log('BlockChain.addBlockToChain(): prcessTransactions() failed');
                //     return false;
                // }
                this.blockchain.push(latestBlockReceived);
                // this.setUnspentTransactionOuts(this.getUnspentTransactionOuts());
                // this.updateTransactionPool(_unspentTransactions);
                return true;
            }
        }
        console.log('BlockChain.addBlockToChain(): new block index is the same as the last block');
        return false;
    }

    /**
     * @description - process the transaction for the given block
     * @param latestBlockReceived - block to have the transactions processed
     */
    public processTransactions(latestBlockReceived: Block): void {
        //throw new Error("Method not implemented.");
        /**
         * Process transactions means.
         * 1. mark successfull if good signature and the from balance > value + fee -- call this.validateRecievedTransaction()
         * 2. push into this.blockchain.blockchain.
         * 3. remove from pending list. 
         * 
         */
        let _blockTransactions: Transaction[] = latestBlockReceived.transactions;
        for (let i = 0; i < _blockTransactions.length; i++) {
            let message: ValidationMessage = this.validateReceivedTransaction(_blockTransactions[i]);
            console.log('BlockChain.processTransactions(): message=', message.message);
            if (message.message === 'success') {
                _blockTransactions[i].transferSuccessful = true;
                _blockTransactions[i].minedInBlockIndex = latestBlockReceived.index;
            } else {
                console.log('BlockChain.processTransactions(): transaction did not validate for transaction=', _blockTransactions[i].data);
            }
            // Removed this transaction from the pending transactions list.
            for (let j = 0; j < this.getPendingTransactions().length; j++) {
                console.log('BlockChain.processTransactions(): _blockTransactions[' + i + '].transactionDataHash=' + _blockTransactions[i].transactionDataHash);
                console.log('BlockChain.processTransactions(): pendingTransactions[' + j + '].transactionDataHash=' + this.getPendingTransactions()[j].transactionDataHash);
                if (_blockTransactions[i].transactionDataHash === this.getPendingTransactions()[j].transactionDataHash) {
                    this.getPendingTransactions().splice(j, 1); // delete the matching transaction from the pending transactions list.
                }
            }
        }
    }

    /**
     * @description - replace the current blockchain with the given blockchain
     * @param {Block[]} receivedBlocks 
     */
    public replaceChain(receivedBlocks: Block[]): void {
        /**
         * 
        Synchronizing the Chain & Pending Txs
            Synchronizing the chain from certain peer
                First get /info and check the peer's chain cumulative difficulty
                If the peer chain has bigger difficulty, download it from /blocks
                Validate the downloaded peer chain (blocks, transactions, etc.)
                If the peer chain is valid, replace the current chain with it
                Notify all peers about the new chain
            Synchronizing the pending transactions from certain peer
                Download /transactions/pending and append the missing ones
                Transactions with the same hash should never be duplicated

        Validating a Chain
            When a chain is downloaded from a peer, it needs be validated
            Validate the genesis block -> should be exactly the same
            Validate each block from the first to the last
                Validate that all block fields are present and have valid values
                Validate the transactions in the block
                    Validate transaction fields and their values , recalculate the transaction data
                    hash , validate the signature
                Re-execute all transactions, re calculate the values of minedInBlockIndex and
                transferSuccessful fields

            Validate each block from the first to the last (cont.)
                Re-calculate the block data hash and block hash for each block
                Ensure the block hash matches the block difficulty
                Validate that prevBlockHash == the hash of the previous block
            Re-calculate the cumulative difficulty of the incoming chain
            If the cumulative difficulty > current cumulative difficulty
                Replace the current chain with the incoming chain
                Clear all current mining jobs (because they are invalid)
         */
        // TODO: Need to write this.
        if (this.getCumulativeDifficulty(this.getBlockchain()) < this.getCumulativeDifficulty(receivedBlocks)) {
            // Get ready to replace this node's blockchain.
            /**
             * Validate the peer chain (blocks, transactions, etc.)
             * If valid, then replace the current chain with the peer's chain.
             * Notify all the other peers about the new chain.
             */
            let _success: boolean;
            _success = this.isValidPeerChain(receivedBlocks);
            if (_success !== false) {
                for (let i = 0; i < receivedBlocks.length; i++) {
                    this.processTransactions(receivedBlocks[i]);
                    // _success = this.processTransactions(receivedBlocks[i]);
                    // if (_success === false) {
                    //     console.log('BlockChain.replaceChain(): unable to process transactions');
                    //     return;
                    // }
                }
                this.blockchain = receivedBlocks;
                this.p2p.broadcastLatestBlockToOtherNodes();
            } else {
                console.log('BlockChain.replaceChain(): Received blockchain did not validate');
            }
        } else {
            console.log('BlockChain.replaceChain(): Received blockchain is valid');
        }
    }

    /**
     * @description - validate the peer genesis block against this blockchain's genesis block.
     * @param {Block} peerGenesisBlock 
     * @returns {boolean}
     */
    private isValidGenesisBlock(peerGenesisBlock: Block): boolean {
        return JSON.stringify(peerGenesisBlock) === JSON.stringify(this.getGenesisBlock());
    }

    /**
     * @description - validate the blocks in the given blockchain
     * @param {Block[]} peerChain - peer block chain to validate.
     * @returns {boolean} 
     */
    private isValidPeerChain(peerChain: Block[]): boolean {
        if (this.isValidGenesisBlock(peerChain[0]) === false) {
            return null;
        }
        for (let i = 0; i < peerChain.length; i++) {
            const currentBlock: Block = peerChain[i];
            if (i !== 0 && !this.isValidNewBlock(currentBlock, peerChain[i - 1])) {
                return false;
            }
        }
        return true;
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
    public getCumulativeDifficulty(_blockchain: Block[]): number {
        // TODO: How does this get calculated?
        /**
         * Calculating the Cumulative Difficulty
            Difficulty 0 == 0 leading zeroes -> every hash works well
            Difficulty 1 == 1 leading zero -> 1/16 of hashes work
            Difficulty 2 == 2 leading zero -> 1/256 of hashes work
            Conclusion: difficulty p is 16 times more difficult than p 1
            Cumulative difficulty == how much effort is spent to calculate it
                cumulativeDifficulty == 16 ^ d 0 + 16 ^ d 1 + … 16 ^ d n
                where d 0 , d 1 , … d n are the individual difficulties of the blocks
        */
        let _cumulativeDifficulty: number = 0;
        for (let i = 0; i < _blockchain.length; i++) {
            //_cumulativeDifficulty += 16 ** _blockchain[i].difficulty;
            _cumulativeDifficulty += Math.pow(16, _blockchain[i].difficulty);
            //.map((difficulty) => Math.pow(2, difficulty))
        }
        return _cumulativeDifficulty;
    }

    /**
     * @description - calculate the confirmation count
     * @param {Transaction} _transaction 
     * @returns {number} confirmation count
     */
    private calculateConfirmationCount(_transaction: Transaction): number {
        let rVal: number = 1;
        let currentBlockHeight: number = this.getBlocksCount();
        let transactionBlockIndex: number = _transaction.minedInBlockIndex;
        rVal = currentBlockHeight - transactionBlockIndex + 1;
        return rVal;
    }

    /**
     * @description - get the account balances for the given account address 
     * @param {string} address 
     * @returns {Balance} balance
     */
    public getAccountBalance(address: string): Balance {
        let addressExists: boolean = false;
        let balance: Balance = new Balance();
        // calculate the balances for this account.
        balance.accountAddress = address;
        let myTrans: Transaction[] = this.getAllTransactions();
        if (myTrans === undefined) {
            return null;
        }
        let confirmedSum: number = 0;
        let confirmedOneSum: number = 0;
        let pendingSum: number = 0;
        for (let i = 0; i < myTrans.length; i++) {
            if ((myTrans[i].from === address || myTrans[i].to === address) && !addressExists) {
                addressExists = true;
            }
            if (myTrans[i].transferSuccessful === true && addressExists) {
                let _comfirmationCount = this.calculateConfirmationCount(myTrans[i]);
                if (_comfirmationCount >= this.config.confirmCount && _comfirmationCount < this.config.safeConfirmCount) {
                    if (myTrans[i].from === address && myTrans[i].to !== address) {
                        confirmedOneSum -= myTrans[i].value - myTrans[i].fee;
                    } else {
                        confirmedOneSum += myTrans[i].value;
                    }
                } else if (_comfirmationCount >= this.config.safeConfirmCount) {
                    if (myTrans[i].from === address && myTrans[i].to !== address) {
                        confirmedSum -= myTrans[i].value - myTrans[i].fee;
                    } else {
                        confirmedSum += myTrans[i].value;
                    }
                } else {
                    if (myTrans[i].from === address && myTrans[i].to !== address) {
                        pendingSum -= myTrans[i].value - myTrans[i].fee;
                    } else {
                        pendingSum += myTrans[i].value;
                    }
                }
            }
        }
        if (addressExists === false) {
            return null;
        }
        balance.confirmedBalance = confirmedOneSum;
        balance.safeBalance = confirmedSum;
        balance.pendingBalance = pendingSum;

        return balance;
    }
}