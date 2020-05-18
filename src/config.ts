import { Block } from "./block";

export class Config {
    public defaultServerHost: string;
    public defaultServerPort: number;
    public faucetPrivateKey: string;
    public faucetPublicKey: string;
    public faucetAddress: string;
    public nullAddress: string;
    public nullPubKey: string;
    public nullSignature: string[] = [];
    public startDifficulty: number;
    public minTransactionFee: number;
    public maxTransactionFee: number;
    public blockReward: number;
    public maxTransferValue: number;
    public safeConfirmCount: number;
    public genesisBlock: Block;

    constructor() {

    }
}