import WebSocket from 'ws';
import { Server } from 'ws';
import { Block } from './block';
import { Transaction } from './transaction';
import { BlockChain } from './blockchain';

/**
 * @description - An Enum for the message types.
 * @enum MessageType
 */
enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4
}

/**
 * @description - A class representing a message to peers.
 * @class Message
 */
class Message {
    public type: MessageType;
    public data: any;
}

/**
 * @description - A class for peer-to-peer http communication.  Modified from https://github.com/lhartikk/naivecoin/blob/chapter6/src/p2p.ts
 * @class  P2P
 */
export class P2P {
    /**
     * @description - array of peer-to-peer WebSocket's
     */
    private sockets: WebSocket[] = [];
    /**
     * @description - array of peer url's
     */
    private peers: string[] = [];
    /**
     * @description - listener port of this peer.
     */
    private listenerPort: number;

    /**
    * @description - Create a P2P.
    * @constructor
    * @param {Block[]} blockchain - The blockchain.
    */
    constructor(private blockchain: BlockChain) {

    }

    /**
     * @description - Convert a string to a JSON object.
     * @param {string} data - the string to be converted.
     * @returns {T} Object - object requested.
     */
    public JSONToObject = <T>(data: string): T => {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.log(e);
            return null;
        }

    }

    /**
     * @description - Initialize the listener for this peer-to-peer server 
     * @param {number} p2pPort - port number to listen on.
     */
    public initP2PServer(p2pPort: number) {
        this.listenerPort = p2pPort;
        const server: Server = new WebSocket.Server({ port: p2pPort });
        server.on('connection', (ws: WebSocket) => {
            this.initConnection(ws);
            console.log('ws=' + ws);
        });
        console.log('listening websocket p2p port on: ' + p2pPort);
    }

    /**
     * @description - Get the array of WebSocket's
     * @returns {WebSocket[]} sockets
     */
    public getSockets(): WebSocket[] {
        return this.sockets;
    }

    /**
     * @description - Returns the number of peers.
     * @returns {number} peerCount;
     */
    public getPeerCount(): number {
        return this.sockets.length;
    }

    public getPeers(): string[] {
        let rVal: string[] = this.peers;
        return rVal;
    }

    /**
     * @description - Initialize the given websocket
     * @param {WebSocket} ws - websocket to be initialized
     */
    public initConnection(ws: WebSocket) {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.queryChainLengthMsg());

        // query transactions pool only some time after chain query
        setTimeout(() => {
            this.broadcast(this.queryTransactionPoolMsg());
        }, 500);
    }

    /**
     * @description - Initialize the websocket for the message handler.
     * @param {WebSocket} ws - websocket for sending messages.
     */
    public initMessageHandler(ws: WebSocket) {
        ws.on('message', (data: string) => {

            try {
                const message: Message = this.JSONToObject<Message>(data);
                if (message === null) {
                    console.log('could not parse received JSON message: ' + data);
                    return;
                }
                console.log(this.listenerPort + ':Received message: %s', JSON.stringify(message));
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        this.write(ws, this.responseLatestMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        this.write(ws, this.responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        const receivedBlocks: Block[] = this.JSONToObject<Block[]>(message.data);
                        if (receivedBlocks === null) {
                            console.log(this.listenerPort + ':invalid blocks received: %s', JSON.stringify(message.data));
                            break;
                        }
                        this.handleBlockchainResponse(receivedBlocks);
                        break;
                    case MessageType.QUERY_TRANSACTION_POOL:
                        this.write(ws, this.responseTransactionPoolMsg());
                        break;
                    case MessageType.RESPONSE_TRANSACTION_POOL:
                        const receivedTransactions: Transaction[] = this.JSONToObject<Transaction[]>(message.data);
                        if (receivedTransactions === null) {
                            console.log(this.listenerPort + ':invalid transaction received: %s', JSON.stringify(message.data));
                            break;
                        }
                        receivedTransactions.forEach((transaction: Transaction) => {
                            try {
                                this.blockchain.handleReceivedTransaction(transaction);
                                // if no error is thrown, transaction was indeed added to the pool
                                // let's broadcast transaction pool
                                this.broadCastTransactionPool();
                            } catch (e) {
                                console.log(e.message);
                            }
                        });
                        break;
                }
            } catch (e) {
                console.log(e);
            }
        });
    }

    /**
     * @description - Write a message to a websocket.
     * @param {WebSocket} ws - websockt to write the message to.
     * @param {Message} message - The message to written.
     */
    public write(ws: WebSocket, message: Message): void {
        ws.send(JSON.stringify(message));
    }

    /**
     * @description - Broadcast the given message to all the listeners.
     * @param {Message} message - message to be broadcast.
     */
    public broadcast(message: Message): void {
        this.sockets.forEach((socket) => this.write(socket, message));
    }

    /**
     * @description - Gets the Message object for the QUERY_LATEST.
     * @returns {Message} - message Object
     */
    public queryChainLengthMsg(): Message {
        return ({ 'type': MessageType.QUERY_LATEST, 'data': null });
    }

    /**
     * @description - Gets the Message object for the QUERY_ALL
     * @returns {Message} - message Object
     */
    public queryAllMsg(): Message {
        return ({ 'type': MessageType.QUERY_ALL, 'data': null });
    }

    /**
     * @description - Gets the Message object for the RESPONSE_BLCOKCHAIN.
     * @returns {Message} - message Object for the blockchain.
     */
    public responseChainMsg(): Message {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(this.blockchain.getBlockchain())
        });
    }

    /**
     * @description - Gets the Message object for the RESPONSE_BLCOKCHAIN.
     * @returns {Message} - message Object for the lastest block.
     */
    public responseLatestMsg(): Message {
        return ({
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.blockchain.getLatestBlock()])
        });
    }

    /**
     * @description - Gets the Message object for the QUERY_TRANSACTION_POOL.
     * @returns {Message} - message Object.
     */
    public queryTransactionPoolMsg(): Message {
        return ({
            'type': MessageType.QUERY_TRANSACTION_POOL,
            'data': null
        });
    }

    /**
     * @description - Gets the Message object for the QUERY_TRANSACTION_POOL.
     * @returns {Message} - message Object for the tranaction pool.
     */
    public responseTransactionPoolMsg = (): Message => ({
        'type': MessageType.RESPONSE_TRANSACTION_POOL,
        'data': JSON.stringify(this.blockchain.getTransactionPool())
    })

    /**
     * @description - Initialize the error handler websocket
     * @param {WebSocket} ws 
     */
    public initErrorHandler(ws: WebSocket) {
        const closeConnection = (myWs: WebSocket) => {
            console.log('connection failed to peer: ' + myWs.url);
            this.sockets.splice(this.sockets.indexOf(myWs), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }

    /**
     * @description - Handle the block chain response for the received array of blocks.
     * @param receivedBlocks - array of received blocks.
     */
    public handleBlockchainResponse(receivedBlocks: Block[]) {
        if (receivedBlocks.length === 0) {
            console.log(this.listenerPort + ':received block chain size of 0');
            return;
        }
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
        if (!this.blockchain.isValidBlockStructure(latestBlockReceived)) {
            console.log(this.listenerPort + ':block structuture not valid');
            return;
        }
        const latestBlockHeld: Block = this.blockchain.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log(this.listenerPort + ':blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.blockHash === latestBlockReceived.blockHash) { // TODO: Not sure if this is right.
                if (this.blockchain.addBlockToChain(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            } else if (receivedBlocks.length === 1) {
                console.log(this.listenerPort + ':We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            } else {
                console.log(this.listenerPort + ':Received blockchain is longer than current blockchain');
                this.blockchain.replaceChain(receivedBlocks);
            }
        } else {
            console.log(this.listenerPort + ':received blockchain is not longer than received blockchain. Do nothing');
        }
    }

    /**
     * @description - Broadcast the latest message.
     */
    public broadcastLatest(): void {
        this.broadcast(this.responseLatestMsg());
    }

    /**
     * @description - Connect to a new peer.
     * @param {string} newPeer - string of the new peer to connect to.
     */
    public connectToPeer(newPeer: string): void {
        console.log('newPeer='+newPeer);
        //const ws: WebSocket = new WebSocket.Server({ port: newPeer });
        const ws: WebSocket = new WebSocket(newPeer);
        ws.on('open', () => {
            this.initConnection(ws);
            this.peers.push(newPeer);
        });
        ws.on('error', () => {
            console.log('connection failed');
        });
    }

    /**
     * @description - Connect to the list of peers.
     * @param {string[]} newPeers - array of peers to connect to.
     */
    public connectToPeers(newPeers: string[]): void {
        for (let i = 0; i < newPeers.length; i++) {
            this.connectToPeer(newPeers[i]);
            //this.peers.push(newPeers[i]);
        }
    }

    /**
     * @description - Broadcast the transaction pool message.
     */
    public broadCastTransactionPool() {
        this.broadcast(this.responseTransactionPoolMsg());
    }
}