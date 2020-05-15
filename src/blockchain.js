var block_1 = require('./block');
var BlockChain = (function () {
    function BlockChain() {
    }
    BlockChain.prototype.getBlockchain = function () {
        return [];
    };
    BlockChain.prototype.handleReceivedTransaction = function (transaction) {
    };
    BlockChain.prototype.getLatestBlock = function () {
        //_index: number, _hash: string, _previousHash: string, _timestamp: number, _data: Transaction[], _difficulty: number, _nonce: number)
        return new block_1.Block(0, '', '', 0, [], 0, 0);
    };
    BlockChain.prototype.getTransactionPool = function () {
        return [];
    };
    BlockChain.prototype.isValidBlockStructure = function (latestBlockReceived) {
        return false;
    };
    BlockChain.prototype.addBlockToChain = function (latestBlockReceived) {
        return false;
    };
    BlockChain.prototype.replaceChain = function (receivedBlocks) {
    };
    return BlockChain;
})();
exports.BlockChain = BlockChain;
