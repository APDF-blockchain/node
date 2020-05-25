import { sha256, sha224 } from 'js-sha256';
import { Transaction } from './transaction';
import { Block } from './block';
import { Balance } from './balance';
import { Config } from './config';

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
     * @description - a map fo the mining jobs keyed on the (miner address?)
     */
    private miningJobs: Map<string, Block> = new Map<string, Block>();

    /**
     * @description - transactions array to be assigned to the next block to be mined.
     */
    private transactionsPool: Transaction[] = [];

    /**
     * @description - This constructor initializes the blockchain.  Currently the blockchain is not persisted.
     * @constructor
     */
    constructor() {
        if (this.blockchain.length === 0) {
            let transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = -1000010000060;
            transaction.confirmationCount = 1;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            let signature: string = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            let json: string = JSON.stringify(transaction);
            let hash: string = sha256(json)
            transaction.transactionDataHash = hash;
            let transactions: Transaction[] = [];
            transactions.push(transaction);

            transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = -1000005000020;
            transaction.confirmationCount = 6;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            signature = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            json = JSON.stringify(transaction);
            hash = sha256(json)
            transaction.transactionDataHash = hash;
            //let transactions: Transaction[] = [];
            transactions.push(transaction);

            transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = this.config.nullAddress;
            transaction.to = this.config.faucetAddress;
            transaction.value = -1000010000060;
            transaction.confirmationCount = 0;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            signature = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            json = JSON.stringify(transaction);
            hash = sha256(json)
            transaction.transactionDataHash = hash;
            //let transactions: Transaction[] = [];
            transactions.push(transaction);
            this.genesisBlock = new Block(
                0,
                '0000000000000000000000000000000000000000000000000000000000000000',
                new Date().getTime(),
                transactions,
                0,
                0
            );
            json = JSON.stringify(this.genesisBlock);
            hash = sha256(json);
            this.genesisBlock.blockHash = hash;
            json = JSON.stringify(transactions);
            hash = sha256(json);
            this.genesisBlock.blockDataHash = hash;
            this.blockchain.push(this.genesisBlock);
            this.chainId = this.config.chainId;
        }
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
        let mytrans: Transaction[] = this.getConfirmedTransactions();
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
            if (_aTrans[i].tranferSuccessful === true) {
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
     * @description - handle received transaction
     * @param {Transaction} transaction 
     */
    public handleReceivedTransaction(transaction: Transaction): void {
        this.transactionsPool.push(transaction);
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
     * @returns {booean}
     */
    public addBlockToChain(latestBlockReceived: Block): boolean {
        return true;
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
                if (myTrans[i].confirmationCount === 1) {
                    if (myTrans[i].from === address) {
                        confirmedOneSum += myTrans[i].value - myTrans[i].fee;
                    } else {
                        confirmedOneSum -= myTrans[i].value;
                    }
                } else if (myTrans[i].confirmationCount === 6) {
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