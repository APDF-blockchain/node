import { Block } from "./block";

export class Config {
    public defaultServerHost: string;
    public defaultP2pHost: string;
    public defaultServerPort: number;
    public defaultP2pPort: number;
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
        this.defaultServerHost = 'localhost';
        this.defaultP2pHost = 'localhost';
        this.defaultServerPort = 3001;
        this.defaultP2pPort = 6001;
        this.faucetPrivateKey = "838ff8634c41ba62467cc874ca156830ba55efe3e41ceeeeae5f3e77238f4eef";
        this.faucetPublicKey = '8c4431db61e9095d5794ff53a3ae4171c766cadef015f2e11bec22b98a80f74a0';
        this.faucetAddress = 'f3a1e69b6176052fcc4a3248f1c5a91dea308ca9';
        this.nullAddress = '0000000000000000000000000000000000000000';
        this.nullPubKey = '00000000000000000000000000000000000000000000000000000000000000000';
        this.nullSignature.push('0000000000000000000000000000000000000000000000000000000000000000');
        this.nullSignature.push('0000000000000000000000000000000000000000000000000000000000000000');
        this.startDifficulty = 4;
        this.minTransactionFee = 10;
        this.maxTransactionFee = 1000000;
        this.blockReward = 5000000;
        this.maxTransferValue = 10000000000000;
        this.safeConfirmCount = 3;
    }
}