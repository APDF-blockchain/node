import WebSocket from 'ws';
import { Server } from 'ws';
import { Block } from './models/block';
import { Transaction } from './models/transaction';
import { BlockChain } from './blockchain';

/**
 * @classdesc - An Enum for the message types.
 * @enum MessageType
 */
enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4,
    PEER_MSG = 5
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
     * @description - map of my peers.
     */
    private peersMap: Map<string, boolean> = new Map<string, boolean>();

    /**
     * @description - mylistener port of this peer.
     */
    private mylistenerPort: number;

    /**
     * @description - my listener host
     */
    private mylistenerHost: string;

    /**
     * @description - my listener url
     */
    private mylistenerUrl: string;

    /**
    * @description - Create a P2P.
    * @constructor
    * @param {Block[]} blockchain - The blockchain.
    */
    constructor(private blockchain: BlockChain) {
        this.mylistenerHost = 'localhost';
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
     * @description - Initialize the mylistener for this peer-to-peer server 
     * @param {number} p2pPort - port number to listen on.
     */
    public initP2PServer(p2pPort: number) {
        this.mylistenerPort = p2pPort;
        this.mylistenerUrl = 'ws://' + this.mylistenerHost + ":" + p2pPort;
        const server: Server = new WebSocket.Server({ port: p2pPort });
        server.on('connection', (ws: WebSocket, req: Request) => {
            //console.log('req='+JSON.stringify(req));
            let remoteAddress: string = req.url;
            console.log('REMOTE ADDRESS=' + remoteAddress);
            console.log("URL=" + ws.url);
            this.initConnection(ws);
            console.log('initP2PServer(): ws=' + ws + ' and p2pPort=' + p2pPort);
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

    /**
     * @description - get all my peers.
     */
    public getPeers(): string[] {
        let rVal: string[] = [];
        for (let key of this.peersMap.keys()) {
            //console.log(key);
            if (this.peersMap.get(key) === true) {
                rVal.push(key);
            }
        }
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
        // let tstring: string = JSON.stringify(ws);
        // console.log('DEBUG 1 Remote address='+tstring)
        ws.on('message', (data: string) => {

            try {
                const message: Message = this.JSONToObject<Message>(data);
                if (message === null) {
                    console.log(this.mylistenerPort + ':could not parse received JSON message: ' + data);
                    return;
                }
                console.log(this.mylistenerPort + ':Received message: %s', JSON.stringify(message));
                // let tstring: string = JSON.stringify(ws);
                // console.log('DEBUG 2 Remote address='+tstring)
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        this.write(ws, this.responseLatestBlockMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        this.write(ws, this.responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        const receivedBlocks: Block[] = this.JSONToObject<Block[]>(message.data);
                        if (receivedBlocks === null) {
                            console.log(this.mylistenerPort + ':invalid blocks received: %s', JSON.stringify(message.data));
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
                            console.log(this.mylistenerPort + ':invalid transaction received: %s', JSON.stringify(message.data));
                            break;
                        }
                        receivedTransactions.forEach((transaction: Transaction) => {
                            try {
                                this.blockchain.handleReceivedTransaction(transaction);
                                // if no error is thrown, transaction was indeed added to the pool
                                // let's broadcast transaction pool
                                this.broadCastTransactionPool();
                            } catch (e) {
                                console.log(this.mylistenerPort + '"P2P.RESPONSE_TRANSACTION_POOL got: ',e.message);
                            }
                        });
                        break;
                    case MessageType.PEER_MSG:
                        console.log(this.mylistenerPort + ':connect to PEER message received: ' + message.data);
                        //this.peers.push(message.data);
                        this.addPeer(message.data);
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
     * @description - Gets the Message object for the RESPONSE_BLOCKCHAIN.
     * @returns {Message} - message Object for the lastest block.
     */
    public responseLatestBlockMsg(): Message {
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
            this.removePeer(myWs.url);
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
            console.log(this.mylistenerPort + ':received block chain size of 0');
            return;
        }
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
        if (!this.blockchain.isValidBlockStructure(latestBlockReceived)) {
            console.log(this.mylistenerPort + ':block structuture not valid');
            console.log('P2P.handleBlockchainRespons(): receivedBlock='+JSON.stringify(latestBlockReceived));
            return;
        }
        const latestBlockHeld: Block = this.blockchain.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log(this.mylistenerPort + ':blockchain possibly behind. We got: '
                + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.blockHash === latestBlockReceived.blockHash) { // TODO: Not sure if this is right.
                if (this.blockchain.addBlockToChain(latestBlockReceived)) {
                    this.broadcast(this.responseLatestBlockMsg());
                }
            } else if (receivedBlocks.length === 1) {
                console.log(this.mylistenerPort + ':We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            } else {
                console.log(this.mylistenerPort + ':Received blockchain is longer than current blockchain');
                this.blockchain.replaceChain(receivedBlocks);
             }
        } else {
            console.log(this.mylistenerPort + ':received blockchain is not longer than received blockchain. Do nothing');
        }
    }

    /**
     * @description - Broadcast the latest block to the other nodes..
     */
    public broadcastLatestBlockToOtherNodes(): void {
        console.log('p2p.broadcastLatestBlockToOtherNodes(): call to broadcast the latest block.');
        this.broadcast(this.responseLatestBlockMsg());
    }

    /**
     * @description - Broadcast the latest blockchain to the other nodes.
     */
    public broadcastNewBlockchainToOtherNodes(): void {
        console.log('p2p.broadcastNewBlockchainToOtherNodes(): call to broadcast the latest blockchain.');
        this.broadcast(this.responseChainMsg());
    }

    /**
     * @description - add a peer to me.
     * @param {string} url 
     */
    public addPeer(url: string) {
        this.peersMap.set(url, true);
    }

    /**
     * @description - Remove a peer from me
     * @param {string} url 
     */
    public removePeer(url: string): void {
        this.peersMap.set(url, false);
    }

    /**
     * @description - Connect to a new peer.
     * @param {string} newPeer - string of the new peer to connect to.
     */
    public connectToPeer(newPeer: string): void {
        console.log('newPeer=' + newPeer);
        //const ws: WebSocket = new WebSocket.Server({ port: newPeer });
        const ws: WebSocket = new WebSocket(newPeer);
        ws.on('open', () => {
            this.initConnection(ws);
            //this.peers.push(newPeer);
            this.addPeer(newPeer);
            this.write(ws, { 'type': MessageType.PEER_MSG, 'data': this.mylistenerUrl })
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
        console.log('p2p.broaCastTransactionPool(): called...');
        this.broadcast(this.responseTransactionPoolMsg());
    }
}