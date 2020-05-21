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
    private confirmedTransactionsCount: number = 0;
    private pendingTransactionsCount: number = 0;
    private blockchain: Block[] = [];
    private genesisBlock: Block;
    private chainId: string;
    private balances: Balance[] = [];
    private pendingTransactions: Transaction[] = [];
    private confirmedTransactions: Transaction[] = [];
    private config: Config = new Config();
    private difficulty: number = this.config.startDifficulty;;
    private cumulativeDifficulty: number = this.difficulty;
    private miningJobs: Map<string, Block> = new Map<string, Block>();

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
            transaction.from = "0000000000000000000000000000000000000000";
            //transaction.to = "f3a1e69b6176052fcc4a3248f1c5a91dea308ca9";
            transaction.to = this.config.faucetAddress;
            transaction.value = 1000000000000;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            //transaction.transactionDataHash = "8a684cb8491ee419e7d46a0fd2438cad82d1278c340b5d01974e7beb6b72ecc2";
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
            this.chainId = "5967d641bed609abf11933204e3c8d87b9969ee8aea9f1568d1b23bb30453981";
            // let balance = new Balance();
            // balance.accountAddress = '0000000000000000000000000000000000000000';
            // balance.confirmedBalance = -1000010000060;
            // this.balances.push(balance);
            // balance = new Balance();
            // balance.accountAddress = 'f3a1e69b6176052fcc4a3248f1c5a91dea308ca9';
            // balance.confirmedBalance = 999998799980;
            // this.balances.push(balance);
            // balance = new Balance();
            // balance.accountAddress = '84ede81c58f5c490fc6e1a3035789eef897b5b35';
            // balance.confirmedBalance = 10000060;
            // this.balances.push(balance);
        }
    }

    /**
     * @description - Get balances
     * @returns {Balance[]} balances
     */
    getBalances(): Balance[] {
        return this.balances;
    }

    /**
     * @description - Add a confirmed transaction to this blockchain
     * @param {Transaction} trans - confirmed transaction to be added
     */
    addConfirmedTransaction(trans: Transaction): void {
        this.confirmedTransactions.push(trans);
    }

    /**
     * @description - Add a pending transaction to the this blockchain
     * @param trans - pending transction to be added
     */
    addPendingTransaction(trans: Transaction): void {
        this.pendingTransactions.push(trans);
    }

    /**
     * @description - get the pending transactions for this blockchain
     * @returns {Transaction[]} pendingTransaction
     */
    getPendingTransactions(): Transaction[] {
        return this.pendingTransactions;
    }

    /**
     * @description - get the confirmed transactions
     * @returns {Transaction[]} confirmedTransactions
     */
    getConfirmedTransactions(): Transaction[] {
        return this.confirmedTransactions;
    }

    /**
     * @description - add confirmed balance to balances
     * @param {string} accountAddress
     * @param {number} amount 
     */
    addConfirmedBalance(accountAddress: string, amount: number): void {
        let balance: Balance = new Balance();
        balance.accountAddress = accountAddress;
        balance.confirmedBalance = amount;
        this.balances.push(balance);
    }

    /**
     * @description - get the confirmed transactons count
     * @returns {number} count
     */
    getConfirmedTransactionsCount(): number {
        return this.confirmedTransactionsCount;
    }

    /**
     * @description - get the pending transactions count
     * @returns {number} count
     */
    getPendingTransactionsCount(): number {
        return this.pendingTransactionsCount;
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

    }

    /**
     * @description - get the latest block in the blockchain
     * @returns {Block} latestBlock
     */
    public getLatestBlock(): Block {
        //_index: number, _hash: string, _timestamp: number, _data: Transaction[], _difficulty: number, _nonce: number)
        // return new Block(
        //     0,
        //     '',
        //     0,
        //     [],
        //     0,
        //     0
        // );
        let latestBlock: Block = this.getBlockchain()[this.getBlockchain().length - 1];
        return latestBlock;
    }

    /**
     * @description - get the array of transactions
     * @returns {Transaction[]} transactions
     */
    public getTransactionPool(): Transaction[] {
        return [];
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
    public replaceChain(receivedBlocks: Block[]): void  {

    }

    /**
     * @description - get the current difficulty
     * @returns {number} current difficulty
     */
    getCurrentDifficulty(): number {
        return this.difficulty;
    }

    /**
     * @description - get the cumulative difficulty
     * @returns {number} cumulative difficulty
     */
    getCumulativeDifficulty(): number {
        return this.cumulativeDifficulty;
    }
}