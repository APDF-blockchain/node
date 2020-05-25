"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
/**
 * @classdesc - This class contains the attributes of a block in the blockchain.
 * @class Block
 */
class Block {
    /**
     * @constructor
     * @description - represents a block in the blockchain
     * @param {number} _index - index of the block
     * @param {string} _hash - hash value for the block
     * @param {number} _timestamp - timestamp of the time the block was created
     * @param {Transaction[]} _data - array of transactions associated with the block
     * @param {number} _difficulty - difficulty of block
     * @param {number} _nonce - nounce value of the block
     */
    constructor(_index, _hash, _timestamp, _data, _difficulty, _nonce) {
        this.index = _index;
        this.blockHash = _hash;
        this.timestamp = _timestamp;
        this.transactions = _data;
        this.difficulty = _difficulty;
        this.nonce = _nonce;
        this.minedBy = "0000000000000000000000000000000000000000";
        this.blockDataHash = "0000000000000000000000000000000000000000000000000000000000000000";
        this.previousBlockHash = "0000000000000000000000000000000000000000000000000000000000000000";
        this.dateCreated = new Date();
    }
}
exports.Block = Block;
//# sourceMappingURL=block.js.map