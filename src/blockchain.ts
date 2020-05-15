import { Transaction } from './transaction';
import { Block } from './block';
export class BlockChain {
    constructor() {

    }

    public getBlockchain(): Block[] {
        return [];
    }
    public handleReceivedTransaction(transaction: Transaction) {

    }

    public getLatestBlock(): Block {
        //_index: number, _hash: string, _previousHash: string, _timestamp: number, _data: Transaction[], _difficulty: number, _nonce: number)
        return new Block(
            0,
            '',
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
}