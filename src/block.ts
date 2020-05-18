import { Transaction } from './transaction';
export class Block {
    public index: number;
    public blockDataHash: string;
    public timestamp: number;
    public transactions: Transaction[];
    public difficulty: number;
    public nonce: number;
    public minedBy: string;
    public dateCreated: Date;
    public blockHash: string;

    constructor(_index: number, _hash: string, _timestamp: number, _data: Transaction[], _difficulty: number, _nonce: number) {
        this.index = _index;
        this.blockHash = _hash;
        this.timestamp = _timestamp;
        this.transactions = _data;
        this.difficulty = _difficulty;
        this.nonce = _nonce;
        this.minedBy = "0000000000000000000000000000000000000000";
        this.blockDataHash = "15cc5052fb3c307dd2bfc6bcaa057632250ee05104e4fb7cc75e59db1a92cefc";
        this.dateCreated = new Date();
    }
}