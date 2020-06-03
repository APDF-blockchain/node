/**
 * @classdesc - data the comes from the miner
 * @class FromMinerRequest
 */
export class FromMinerRequest {
    /**
     * @description - calculated by the node for the transactions
     */
    public blockDataHash: string;
    /**
     * @description - set by the miner
     */
    public dateCreated: Date;
    /**
     * @description - set by the miner
     */
    public nonce: number;
    /**
     * @description - set by the miner
     */
    public blockHash: string;

    /**
     * @constructor
     */
    constructor() {

    }
}