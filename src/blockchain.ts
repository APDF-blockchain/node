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
     */
    getPendingTransactions(): Transaction[] {
        return this.pendingTransactions;
    }

    getConfirmedTransactions(): Transaction[] {
        return this.confirmedTransactions;
    }

    getBalance(): Balance[] {
        return this.balances;
    }

    addConfirmedBalance(accountAddress: string, amount: number) {
        let balance: Balance = new Balance();
        balance.accountAddress = accountAddress;
        balance.confirmedBalance = amount;
        this.balances.push(balance);
    }

    getConfirmedTransactionsCount() {
        return this.confirmedTransactionsCount;
    }

    getPendingTransactionsCount() {
        return this.pendingTransactionsCount;
    }

    public getGenesisBlock(): Block {
        return this.genesisBlock;
    }

    public getChainId(): string {
        return this.chainId;
    }

    public getBlockchain(): Block[] {
        return this.blockchain;
    }

    public getBlocksCount(): number {
        return this.blockchain.length;
    }

    public handleReceivedTransaction(transaction: Transaction) {

    }

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

    public getTransactionPool(): Transaction[] {
        return [];
    }
    
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

    public addBlockToChain(latestBlockReceived: Block): boolean {
        return true;
    }

    public replaceChain(receivedBlocks: Block[]): void  {

    }

    getCurrentDifficulty(): number {
        return this.difficulty;
    }

    getCumulativeDifficulty(): number {
        return this.cumulativeDifficulty;
    }
}