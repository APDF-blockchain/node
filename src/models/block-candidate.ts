/**
 * @classdesc - contains the fields expected by the miner
 * @class BlockCandidate
 */
export class BlockCandidate {
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
     * @description - calculated by the miner.
     */
    public blockDataHash: string;

    /**
     * @constructor
     */
    constructor() {

    }
}