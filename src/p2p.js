var WebSocket = require('ws');
/**
 * An Enum for the message types.
 * @enum MessageType
 */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
    MessageType[MessageType["QUERY_TRANSACTION_POOL"] = 3] = "QUERY_TRANSACTION_POOL";
    MessageType[MessageType["RESPONSE_TRANSACTION_POOL"] = 4] = "RESPONSE_TRANSACTION_POOL";
})(MessageType || (MessageType = {}));
/**
 * A class representing a message to peers.
 * @class Message
 */
var Message = (function () {
    function Message() {
    }
    return Message;
})();
/**
 * A class for peer-to-peer http communication.  Modified from https://github.com/lhartikk/naivecoin/blob/chapter6/src/p2p.ts
 * @class  P2P
 */
var P2P = (function () {
    /**
    * Create a P2P.
    * @param {Block[]} blockchain - The blockchain.
    */
    function P2P(blockchain) {
        var _this = this;
        this.blockchain = blockchain;
        this.sockets = [];
        /**
         * Convert a string to a JSON object.
         * @param {string} data - the string to be converted.
         * @returns {T} Object - object requested.
         */
        this.JSONToObject = function (data) {
            try {
                return JSON.parse(data);
            }
            catch (e) {
                console.log(e);
                return null;
            }
        };
        /**
         * Gets the Message object for the QUERY_TRANSACTION_POOL.
         * @returns {Message} - message Object for the tranaction pool.
         */
        this.responseTransactionPoolMsg = function () { return ({
            'type': MessageType.RESPONSE_TRANSACTION_POOL,
            'data': JSON.stringify(_this.blockchain.getTransactionPool())
        }); };
    }
    /**
     * Initialize the listener for this peer-to-peer server
     * @param {number} p2pPort - port number to listen on.
     */
    P2P.prototype.initP2PServer = function (p2pPort) {
        var _this = this;
        var server = new WebSocket.Server({ port: p2pPort });
        server.on('connection', function (ws) {
            _this.initConnection(ws);
        });
        console.log('listening websocket p2p port on: ' + p2pPort);
    };
    /**
     * Get the array of WebSocket's
     * @returns {WebSocket[]} sockets
     */
    P2P.prototype.getSockets = function () {
        return this.sockets;
    };
    /**
     * Initialize the given websocket
     * @param {WebSocket} ws - websocket to be initialized
     */
    P2P.prototype.initConnection = function (ws) {
        var _this = this;
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.queryChainLengthMsg());
        // query transactions pool only some time after chain query
        setTimeout(function () {
            _this.broadcast(_this.queryTransactionPoolMsg());
        }, 500);
    };
    /**
     * Initialize the websocket for the message handler.
     * @param {WebSocket} ws - websocket for sending messages.
     */
    P2P.prototype.initMessageHandler = function (ws) {
        var _this = this;
        ws.on('message', function (data) {
            try {
                var message = _this.JSONToObject(data);
                if (message === null) {
                    console.log('could not parse received JSON message: ' + data);
                    return;
                }
                console.log('Received message: %s', JSON.stringify(message));
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        _this.write(ws, _this.responseLatestMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        _this.write(ws, _this.responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        var receivedBlocks = _this.JSONToObject(message.data);
                        if (receivedBlocks === null) {
                            console.log('invalid blocks received: %s', JSON.stringify(message.data));
                            break;
                        }
                        _this.handleBlockchainResponse(receivedBlocks);
                        break;
                    case MessageType.QUERY_TRANSACTION_POOL:
                        _this.write(ws, _this.responseTransactionPoolMsg());
                        break;
                    case MessageType.RESPONSE_TRANSACTION_POOL:
                        var receivedTransactions = _this.JSONToObject(message.data);
                        if (receivedTransactions === null) {
                            console.log('invalid transaction received: %s', JSON.stringify(message.data));
                            break;
                        }
                        receivedTransactions.forEach(function (transaction) {
                            try {
                                _this.blockchain.handleReceivedTransaction(transaction);
                                // if no error is thrown, transaction was indeed added to the pool
                                // let's broadcast transaction pool
                                _this.broadCastTransactionPool();
                            }
                            catch (e) {
                                console.log(e.message);
                            }
                        });
                        break;
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    };
    /**
     * Write a message to a websocket.
     * @param {WebSocket} ws - websockt to write the message to.
     * @param {Message} message - The message to written.
     */
    P2P.prototype.write = function (ws, message) {
        ws.send(JSON.stringify(message));
    };
    /**
     * Broadcast the given message to all the listeners.
     * @param {Message} message - message to be broadcast.
     */
    P2P.prototype.broadcast = function (message) {
        var _this = this;
        this.sockets.forEach(function (socket) { return _this.write(socket, message); });
    };
    /**
     * Gets the Message object for the QUERY_LATEST.
     * @returns {Message} - message Object
     */
    P2P.prototype.queryChainLengthMsg = function () {
        return ({ 'type': MessageType.QUERY_LATEST, 'data': null });
    };
    /**
     * Gets the Message object for the QUERY_ALL
     * @returns {Message} - message Object
     */
    P2P.prototype.queryAllMsg = function () {
        return ({ 'type': MessageType.QUERY_ALL, 'data': null });
    };
    /**
     * Gets the Message object for the RESPONSE_BLCOKCHAIN.
     * @returns {Message} - message Object for the blockchain.
     */
    P2P.prototype.responseChainMsg = function () {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(this.blockchain.getBlockchain())
        });
    };
    /**
     * Gets the Message object for the RESPONSE_BLCOKCHAIN.
     * @returns {Message} - message Object for the lastest block.
     */
    P2P.prototype.responseLatestMsg = function () {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.blockchain.getLatestBlock()])
        });
    };
    /**
     * Gets the Message object for the QUERY_TRANSACTION_POOL.
     * @returns {Message} - message Object.
     */
    P2P.prototype.queryTransactionPoolMsg = function () {
        return ({
            'type': MessageType.QUERY_TRANSACTION_POOL,
            'data': null
        });
    };
    /**
     * Initialize the error handler websocket
     * @param {WebSocket} ws
     */
    P2P.prototype.initErrorHandler = function (ws) {
        var _this = this;
        var closeConnection = function (myWs) {
            console.log('connection failed to peer: ' + myWs.url);
            _this.sockets.splice(_this.sockets.indexOf(myWs), 1);
        };
        ws.on('close', function () { return closeConnection(ws); });
        ws.on('error', function () { return closeConnection(ws); });
    };
    /**
     * Handle the block chain response for the received array of blocks.
     * @param receivedBlocks - array of received blocks.
     */
    P2P.prototype.handleBlockchainResponse = function (receivedBlocks) {
        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0');
            return;
        }
        var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        if (!this.blockchain.isValidBlockStructure(latestBlockReceived)) {
            console.log('block structuture not valid');
            return;
        }
        var latestBlockHeld = this.blockchain.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (this.blockchain.addBlockToChain(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            }
            else if (receivedBlocks.length === 1) {
                console.log('We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            }
            else {
                console.log('Received blockchain is longer than current blockchain');
                this.blockchain.replaceChain(receivedBlocks);
            }
        }
        else {
            console.log('received blockchain is not longer than received blockchain. Do nothing');
        }
    };
    /**
     * Broadcast the latest message.
     */
    P2P.prototype.broadcastLatest = function () {
        this.broadcast(this.responseLatestMsg());
    };
    /**
     * Connect to a new peer.
     * @param {string} newPeer - string of the new peer to connect to.
     */
    P2P.prototype.connectToPeers = function (newPeer) {
        var _this = this;
        var ws = new WebSocket(newPeer);
        ws.on('open', function () {
            _this.initConnection(ws);
        });
        ws.on('error', function () {
            console.log('connection failed');
        });
    };
    /**
     * Broadcast the transaction pool message.
     */
    P2P.prototype.broadCastTransactionPool = function () {
        this.broadcast(this.responseTransactionPoolMsg());
    };
    return P2P;
})();
exports.P2P = P2P;
