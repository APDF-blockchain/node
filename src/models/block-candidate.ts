/**
 * @classdesc - contains the fields expected by the miner
 * @class BlockCandidate
 */
export class BlockCandidate {
    /**
     * @description - index of the candidate block
     */
    public index: number;
    /**
     * @description - number of transactions included in the block.
     */
    public transactionsIncluded: number;
    /**
     * @description - difficulty of this block
     */
    public difficulty: number;
    /**
     * @description - expected reward.
     */
    public expectedReward: number;
    /**
     * @description - reward address
     */
    public rewardAddress: string;
    /**
     * @description - address of the miner
     */
    public blockDataHash: string;

    /**
     * @constructor
     */
    constructor() {

    }
}