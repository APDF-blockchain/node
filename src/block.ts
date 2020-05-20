import { Transaction } from './transaction';

/**
 * @classdesc - This class contains the attributes of a block in the blockchain.
 * @class Block
 */
export class Block {
    /**
     * @description - index of the block
     */
    public index: number;
    /**
     * @description - the block's data hash of all the transactions data
     */
    public blockDataHash: string;
    /**
     * @description - timestamp of block creation
     */
    public timestamp: number;
    /**
     * @description - array of transactions associated with the block
     */
    public transactions: Transaction[];
    /**
     * @description - mining difficulty of the block
     */
    public difficulty: number;
    /**
     * @description - nounce of the block
     */
    public nonce: number;
    /**
     * @description - who mined the block?
     */
    public minedBy: string;
    /**
     * @description - date of creation of the block
     */
    public dateCreated: Date;
    /**
     * @description - hash of block
     */
    public blockHash: string;

    /**
     * @description - hash of previous block
     */
    public previousBlockHash: string;

    /**
     * @constructor
     * @description - represents a block in the blockchain
     * @param {number} _index - index of the block
     * @param {string} _hash - hash value for the block
     * @param {number} _timestamp - timestamp of the time the block was created
     * @param {Transaction[]} _data - array of transactions associated with the block
     * @param {number} _difficulty - difficulty of block
     * @param {number} _nonce - nounce value of the block
     */
    constructor(
        _index: number,
        _hash: string,
        _timestamp: number,
        _data: Transaction[],
        _difficulty: number,
        _nonce: number) {
        this.index = _index;
        this.blockHash = _hash;
        this.timestamp = _timestamp;
        this.transactions = _data;
        this.difficulty = _difficulty;
        this.nonce = _nonce;
        this.minedBy = "0000000000000000000000000000000000000000";
        this.blockDataHash = "0000000000000000000000000000000000000000000000000000000000000000";
        this.previousBlockHash = "0000000000000000000000000000000000000000000000000000000000000000";
        this.dateCreated = new Date();
    }
}