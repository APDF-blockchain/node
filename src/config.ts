import { Block } from "./models/block";

/**
 * @classdesc - This class contains the configuration for the Node.
 * @class Config
 */
export class Config {
    /**
     * Coins and Rewards
        o Coins are 64 bit integers (no real numbers!)
            o 1 coin = 1 000 milli coins = 1 000 000 micro coins
        o All transfers, fees, block awards are defined in micro coins
        o The block reward (per mined block) is static
            o 5,000,000 micro coins
        o The minimum transaction fee (to avoid spam) is
            o 10 micro coins
     */

    /**
     * @description - 1 coin = 1000 milli-coins = 1,000,000 micro-coins
     */
    public oneCoin: number;
    /**
     * @description - 1 milli-coin = 1000 micro-coins
     */
    public milliCoin: number;
    /**
     * @description - 1 micro-coin
     */
    public microCoin: number;
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
    
    public nullPrivateKey: string;

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

    /**
     * @description - the chain id for the block chain.
     */
    public chainId: string;

    /**
     * @description - the count indicating the number of confirmations required for a confirmed balance.
     */
    public confirmCount: number;

    /**
     * @description - target block time in milliseconds.
     */
    public targetBlockTime: number;

    /**
     * @description - Class constructor initializes the configuration attributes for the entire Node/blockchain.
     * @constructor
     */
    constructor() {
        /**
         * {
      address: 'd0618a61161d600c993093970ca4e75c56c978c41e0f85605bdf5c3fc24fe0c5',
      privateKey: 'cb3aabb88a7d00b2370558897b1f1e7a69a22815a5133da4db9d1d69d8ffbad2',
      publicKey: '0381753f1277e0c01302d7f4f3a474c78b3831bb9a3ab4c4619bbb3e4fcf3fd240'
    }
         */
        this.defaultServerHost = 'localhost';
        this.defaultP2pHost = 'localhost';
        this.defaultServerPort = 3001;
        this.defaultP2pPort = 6001;
        this.faucetPrivateKey = "cb3aabb88a7d00b2370558897b1f1e7a69a22815a5133da4db9d1d69d8ffbad2"; // TODO: get this from the faucet once it is implemented.
        this.faucetPublicKey = '0381753f1277e0c01302d7f4f3a474c78b3831bb9a3ab4c4619bbb3e4fcf3fd240'; //TODO: get this from the faucet once it is implemented. 
        this.faucetAddress = 'd0618a61161d600c993093970ca4e75c56c978c41e0f85605bdf5c3fc24fe0c5'; //TODO: get this from the faucet once it is implemented. 
        this.nullAddress = '0000000000000000000000000000000000000000';
        this.nullPubKey = '00000000000000000000000000000000000000000000000000000000000000000';
        this.nullPrivateKey = '00000000000000000000000000000000000000000000000000000000000000000';
        this.nullSignature = [];
        // this.nullSignature.push('0000000000000000000000000000000000000000000000000000000000000000');
        // this.nullSignature.push('0000000000000000000000000000000000000000000000000000000000000000');
        this.startDifficulty = 1; // SETTING THIS TO A LOW VALUE TO SPEED UP MINING.  RESET THIS LATER TO 4 OR 5.
        this.microCoin = 1;
        this.minTransactionFee = 10 * this.microCoin;
        this.maxTransactionFee = 1000000;
        this.blockReward = 5000000 * this.microCoin;
        this.maxTransferValue = 10000000000000 * this.microCoin;
        this.safeConfirmCount = 3;
        this.chainId = '0000000000000000000000000000000000000000000000000000000000000000';
        this.milliCoin = 1000 * this.microCoin;
        this.oneCoin = 1000 * this.milliCoin;
        this.confirmCount = 1;
        this.safeConfirmCount = 6;
        this.targetBlockTime = 10000; // 10 seconds.
    }
}