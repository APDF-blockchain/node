import { Transaction } from './transaction';
import { Block } from './block';
import { ConfirmedBalances } from './confirmed-balances';
export class BlockChain {

    private difficulty: number = 4;
    private cumulativeDifficulty: number = 4;
    private confirmedTransactionsCount: number = 0;
    private pendingTransactionsCount: number = 0;
    private blockchain: Block[] = [];
    private genesisBlock: Block;
    private chainId: string;
    private confirmedBalances: ConfirmedBalances[] = [];
    private pendingTransactions: Transaction[] = [];
    private confirmedTransactions: Transaction[] = [];

    constructor() {
        if (this.blockchain.length === 0) {
            let transaction = new Transaction();
            transaction.data = "genesis tx";
            transaction.dateCreated = new Date();
            transaction.fee = 0;
            transaction.from = "0000000000000000000000000000000000000000";
            transaction.to = "f3a1e69b6176052fcc4a3248f1c5a91dea308ca9";
            transaction.value = 1000000000000;
            transaction.senderPubKey = "00000000000000000000000000000000000000000000000000000000000000000";
            transaction.transactionDataHash = "8a684cb8491ee419e7d46a0fd2438cad82d1278c340b5d01974e7beb6b72ecc2";
            let signature: string = "0000000000000000000000000000000000000000000000000000000000000000";
            transaction.senderSignature.push(signature);
            transaction.senderSignature.push(signature);
            transaction.minedInBlockIndex = 0;
            transaction.tranferSuccessful = true;
            let transactions: Transaction[] = [];
            transactions.push(transaction);
            this.genesisBlock = new Block(
                0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', 1465154705, transactions, 0, 0
            );
            this.blockchain.push(this.genesisBlock);
            this.chainId = "c6da93eb4249cb5ff4f9da36e2a7f8d0d61999221ed6910180948153e71cc47f";
            let confirmedBalance = new ConfirmedBalances();
            confirmedBalance.accountAddress = '0000000000000000000000000000000000000000';
            confirmedBalance.coinBalance = -1000010000060;
            this.confirmedBalances.push(confirmedBalance);
            confirmedBalance = new ConfirmedBalances();
            confirmedBalance.accountAddress = 'f3a1e69b6176052fcc4a3248f1c5a91dea308ca9';
            confirmedBalance.coinBalance = 999998799980;
            this.confirmedBalances.push(confirmedBalance);
            confirmedBalance = new ConfirmedBalances();
            confirmedBalance.accountAddress = '84ede81c58f5c490fc6e1a3035789eef897b5b35';
            confirmedBalance.coinBalance = 10000060;
            this.confirmedBalances.push(confirmedBalance);
        }
    }

    addConfirmedTransaction(trans: Transaction): void {
        this.confirmedTransactions.push(trans);
    }

    addPendingTransaction(trans: Transaction): void {
        this.pendingTransactions.push(trans);
    }

    getPendingTransactions(): Transaction[] {
        return this.pendingTransactions;
    }

    getConfirmedTransactions(): Transaction[] {
        return this.confirmedTransactions;
    }

    getConfirmedBalances(): ConfirmedBalances[] {
        return this.confirmedBalances;
    }

    addConfirmedBalance(accountAddress: string, amount: number) {
        let confirmedBalance: ConfirmedBalances = new ConfirmedBalances();
        confirmedBalance.accountAddress = accountAddress;
        confirmedBalance.coinBalance = amount;
        this.confirmedBalances.push(confirmedBalance);
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
        return new Block(
            0,
            '',
            0,
            [],
            0,
            0
        );
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