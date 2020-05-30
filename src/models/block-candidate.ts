import { Transaction } from "../transaction";

export class BlockCandidate {
    public index: number;
    public transactionsIncluded: number;
    public difficulty: number;
    public timestamp: number;
    public transactions: Transaction[];
    public expectedReward: number;
    public rewardAddress: string;
    public blockDataHash: string;
    public previousBlockHash: string;

    constructor() {

    }
}