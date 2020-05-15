var Block = (function () {
    function Block(_index, _hash, _previousHash, _timestamp, _data, _difficulty, _nonce) {
        this.index = _index;
        this.hash = _hash;
        this.previousHash = _previousHash;
        this.timestamp = _timestamp;
        this.data = _data;
        this.difficulty = _difficulty;
        this.nonce = _nonce;
    }
    return Block;
})();
exports.Block = Block;
