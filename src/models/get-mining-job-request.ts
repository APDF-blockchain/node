export class GetMiningJobRequest {
    public index: number;
    public transactionsIncluded: number;
    public difficulty: number;
    public expectedReward: number;
    public rewardAddress: string;
    public blockDataHash: string;

    constructor() {

    }
}