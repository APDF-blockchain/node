import { Transaction } from './transaction';
import { Block } from './block';
export class BlockChain {

    private difficulty: number = 4;
    private cumulativeDifficulty: number = 4;
    private confirmedTransactionsCount: number = 0;
    private pendingTransactionsCount: number = 0;
    private blockchain: Block[] = [];
    private genesisBlock: Block;
    private chainId: string;

    constructor() {
        if (this.blockchain.length === 0) {
            this.genesisBlock = new Block(
                0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', 1465154705, [], 0, 0
            );
            this.blockchain.push(this.genesisBlock);
            this.chainId = "c6da93eb4249cb5ff4f9da36e2a7f8d0d61999221ed6910180948153e71cc47f";
        }
    }

    getConfirmedTransactionsCount() {
        return this.confirmedTransactionsCount;
    }

    getPendingTransactionsCount() {
        throw new Error("Method not implemented.");
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
        return false;
    }

    public addBlockToChain(latestBlockReceived: Block): boolean {
        return false;
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