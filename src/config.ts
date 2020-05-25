import { Block } from "./block";

/**
 * @classdesc - This class contains the configuration for the Node.
 * @class Config
 */
export class Config {
    /**
     * @description - default http server host
     */
    public defaultServerHost: string;
    /**
     * @description - default peer-to-pear listener host.
     */
    public defaultP2pHost: string;
    /**
     * @description - default http server port
     */
    public defaultServerPort: number;
    /**
     * @description - default peer-to-peer listener port
     */
    public defaultP2pPort: number;
    /**
     * @description - faucet private key.
     */
    public faucetPrivateKey: string;
    /**
     * @description - faucet public key
     */
    public faucetPublicKey: string;
    /**
     * @description - faucet address
     */
    public faucetAddress: string;
    /**
     * @description - null address
     */
    public nullAddress: string;
    /**
     * @description - null public key
     */
    public nullPubKey: string;
    /**
     * @description - null signature array
     */
    public nullSignature: string[] = [];
    /**
     * @description - the starting difficult level for mining a block
     */
    public startDifficulty: number;
    /**
     * @description - minimum transaction fee
     */
    public minTransactionFee: number;
    /**
     * @description - maximum transaction fee
     */
    public maxTransactionFee: number;
    /**
     * @description - block mining award
     */
    public blockReward: number;
    /**
     * @description - maximum transfer fee
     */
    public maxTransferValue: number;
    /**
     * @description - safe confirm count
     */
    public safeConfirmCount: number;
    /**
     * @description - the genesis block for the blockchain
     */
    public genesisBlock: Block;

    public chainId: string;

    /**
     * @description - Class constructor initializes the configuration attributes for the entire Node/blockchain.
     * @constructor
     */
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
        this.chainId = '5967d641bed609abf11933204e3c8d87b9969ee8aea9f1568d1b23bb30453981';
    }
}