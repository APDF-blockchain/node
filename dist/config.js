"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
/**
 * @classdesc - This class contains the configuration for the Node.
 * @class Config
 */
class Config {
    /**
     * @description - Class constructor initializes the configuration attributes for the entire Node/blockchain.
     * @constructor
     */
    constructor() {
        /**
         * @description - null signature array
         */
        this.nullSignature = [];
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
        this.targetBlockTime = 30; // seconds
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map