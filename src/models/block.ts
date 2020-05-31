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
     * @description - the block reward.
     */
    public reward: number;

    /**
     * @description - reward address of the miner.
     */
    public rewardAddress: string;

    /**
     * @constructor
     * @description - represents a block in the blockchain
     */
    constructor() {
    }
}