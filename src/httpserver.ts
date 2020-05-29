import express = require('express');
import * as  bodyParser from 'body-parser';
import cors from 'cors';

import { BlockChain } from './blockchain'
import { P2P } from './p2p';
import { Config } from './config';
import { Transaction } from './transaction';
import { NodePeers } from './node-peers';
import { Block } from './block';
import { Balance } from './balance';
import { ValidationMessage } from './validation-message';
import { SendTransactionRequest } from './models/send-transaction-request';
import { GetMiningJobRequest } from './models/get-mining-job-request';
import { SubmitBlockRequest } from './models/submit-block-request';
import { sha256 } from 'js-sha256';
import { VerifyBlock } from './models/verify-block';

/**
 * @classdesc - contains the attributes and methods for the http server required by the blockchain
 * @class HttpServer
 */
export class HttpServer {

    /**
     * @description - http listener url
     */
    private listenerUrl: string;
    /**
     * @description - about this block chain
     */
    private about: string = "2020/KingslandUniChain/typescript/Bethany Osueke,Denis Putnam,Olivier Riccini";
    /**
     * @description - the ID of the Node that contains the blockchain
     */
    private nodeId: string;
    /**
     * @description - the configuration for this Node
     */
    private config: Config;
    /**
     * @description - the http port number to listen on for http requests.
     */
    private myHttpPort: number;

    /**
     * @description - initializes this http server
     * @constructor
     * @param {BlockChain} blockchain - blockchain associated with this http server
     * @param {P2P} p2p - the peer-to-peer server associate with this http server 
     */
    constructor(private blockchain: BlockChain, private p2p: P2P) {
        this.config = new Config();
        this.config.genesisBlock = this.blockchain.getGenesisBlock();
    }

    /**
     * @description - get the listener for this http server
     */
    public getListenerUrl(): string {
        return this.listenerUrl;
    }

    /**
     * @description - initialize this http listener for http requests.
     * @param {number} myHttpPort - port number for this listener
     */
    public initHttpServer(myHttpPort: number) {
        this.nodeId = (myHttpPort + Math.random()).toString();
        const app: express.Application = express();
        app.use(bodyParser.json());
        app.use(cors());

        /**
         * @description - http use request
         * @param err - contains any errors in the request
         * @param req - contains the http request object
         * @param res - contains the http response object
         * @param next - contains the http next object.  currently not used.
         */
        app.use((err, req, res, next) => {
            console.log('use() time:', Date.now())
            this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            if (err) {
                res.status(400).send(err.message);
            }
        });

        app.get('/blocks', (req, res) => {
            res.send(this.blockchain.getBlockchain());
        });

        app.get('/info', (req, res) => {
            console.log(this.myHttpPort + ':GET /info');
            //this.listenerUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
            this.listenerUrl = req.protocol + "://" + req.get('host');

            let rVal = {
                'about': this.about,
                'nodeId': this.nodeId,
                'chainId': this.blockchain.getChainId(),
                'nodeUrl': this.getListenerUrl(),
                'peers': this.p2p.getPeerCount(),
                'currentDifficulty': this.blockchain.getCurrentDifficulty(),
                'blockCount': this.blockchain.getBlocksCount(),
                'cumulativeDifficulty': this.blockchain.getCumulativeDifficulty(),
                'confirmedTransactions': this.blockchain.getConfirmedTransactionsCount(),
                'pendingTransactions': this.blockchain.getPendingTransactionsCount()
            };
            res.send(rVal);
        });

        app.get('/debug', (req, res) => {
            console.log(this.myHttpPort + ':GET /debug');
            let hostUrl: string = req.get('host');
            let hostArray: string[] = hostUrl.split(':');
            let rVal = {
                'nodeId': this.nodeId,
                'host': hostArray[0],
                'port': hostArray[1],
                'selfUrl': hostUrl,
                'peers': this.p2p.getPeers(),
                'chain': { 'blocks': this.blockchain.getBlockchain() },
                'chainId': this.blockchain.getChainId(),
                'config': this.config,
                // TODO: For now let's fake it.
                'balances:': this.blockchain.getBalances()
            };
            res.send(rVal);
        });

        app.get('/debug/reset-chain', (req, res) => {
            console.log(this.myHttpPort + ':GET /debug/reset-chain');
        });

        app.get('/debug/mine/:minerAddress/:difficulty', (req, res) => {
            let parms = { 'minerAddress': req.params.minerAddress, 'difficulty': req.params.difficulty };
            console.log(this.myHttpPort + ':GET /debug/mine/:minerAddress/:' + parms.minerAddress + '/:' + parms.difficulty);
        });

        app.get('/blocks/:index', (req, res) => {
            console.log(this.myHttpPort + ':GET /blocks/:' + req.params.index);
            let rVal: Block = this.blockchain.getBlockchain()[req.params.index];
            if (rVal == null) {
                res.status(401).send("No block at index=" + req.params.index);
            } else {
                res.send(rVal);
            }
        });

        app.get('/transactions/pending', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/pending');
            let rVal: Transaction[] = this.blockchain.getPendingTransactions();
            res.send(rVal);
        });

        app.get('/transactions/confirmed', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/confirmed');
            let rVal: Transaction[] = this.blockchain.getConfirmedTransactions();
            res.send(rVal);
        });

        app.get('/transactions/:tranHash', (req, res) => {
            console.log(this.myHttpPort + ':GET /transactions/:' + req.params.tranHash);
            let rVal: Transaction[] = this.blockchain.getTransactionsByTxHash(req.params.tranHash);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no transaction for " + req.params.tranHash + ".");
            }
        });

        app.get('/balances', (req, res) => {
            console.log(this.myHttpPort + ':GET /balances');
            // TODO fake for now.
            let rVal: any[] = this.blockchain.getBalances();
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no balances available");
            }
        });

        app.get('/address/:address/transactions', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/transactions');
            let rVal: Transaction[] = this.blockchain.getTransactions(req.params.address);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no transaction for " + req.params.address + ".");
            }
        });

        app.get('/address/:address/balance', (req, res) => {
            console.log(this.myHttpPort + ':GET /address/:' + req.params.address + '/balance');
            let rVal: Balance = this.blockchain.getAccountBalance(req.params.address);
            if (rVal !== null) {
                res.send(rVal);
            } else {
                res.status(401).send("There are no balances available for the address of " + req.params.address);
            }

        });

        /**
         * @description - add transactions to the transaction pool.
         */
        app.post('/transactions/send', (req, res) => {
            /**
             * Send Transactions
                + For each received transaction the Node does the following:
                    o Checks for missing / invalid fields / invalid field values
                    o Calculates the transaction data hash (unique transaction
                        o Checks for collisions  duplicated transactions are skipped
                    o Validates the transaction public key , validates the signature
                    o Checks the sender account balance to be >= value + fee
                    o Checks whether value >= 0 and fee > 10 (min fee)
                    o Puts the transaction in the "pending transactions " pool
                    o Sends the transaction to all peer nodes through the REST API
                        o It goes from peer to peer until it reaches the entire network
            */
            console.log(this.myHttpPort + ':POST /transactions/send');
            let sendTransRequest: SendTransactionRequest = req.body;
            console.log(sendTransRequest);
            let transaction: Transaction = new Transaction();
            transaction.confirmationCount = 0;
            transaction.data = sendTransRequest.data;
            transaction.dateCreated = sendTransRequest.dateCreated;
            transaction.fee = sendTransRequest.fee;
            transaction.from = sendTransRequest.from;
            transaction.minedInBlockIndex = -1;
            transaction.senderPubKey = sendTransRequest.senderPubKey;
            transaction.senderSignature = sendTransRequest.senderSignature;
            transaction.value = sendTransRequest.value;
            transaction.transactionDataHash = '';
            transaction.tranferSuccessful = false;
            let validation: ValidationMessage = this.blockchain.validateReceivedTransaction(transaction);
            if (validation.message === 'success') {
                this.blockchain.getTransactionPool().push(transaction)
                // broadcast transaction to all the peer nodes.
                this.p2p.broadCastTransactionPool();
                res.status(201).send({ 'transactionDataHash': transaction.transactionDataHash });
            } else {
                console.log(JSON.stringify(validation));
                let errorMsg: string = validation.message;
                res.status(400).send({ 'error': errorMsg });
            }
        });

        app.get('/peers', (req, res) => {
            console.log(this.myHttpPort + ':GET /peers');
            let rVal: string[] = this.p2p.getPeers();
            if (rVal.length !== 0) {
                for (let i = 0; i < rVal.length; i++) {
                    console.log('peer' + i + ':' + rVal[i]);
                }
                res.send(rVal);
            } else {
                res.status(401).send({ 'error': "There currently no peers for this node." });
            }
        });

        app.post('/peers/connect', (req, res) => {
            console.log(this.myHttpPort + ':POST /peers/connect');
            let body: NodePeers = req.body;
            console.log(body);
            this.p2p.connectToPeer(body.peerUrl);
            res.status(201).send("Peers connect requested.");
        });

        // app.post('/peers/notify-new-block', (req, res) => {
        //     console.log(this.myHttpPort + ':POST /peers/notify-new-block');
        // });

        app.post('/stop', (req, res) => {
            res.send({ 'msg': 'stopping server' });
            process.exit();
        });

        app.get('/mining/get-mining-job/:address', (req, res) => {
            console.log(this.myHttpPort + ':GET /mining/get-mining-job/:' + req.params.address);
            if (req.params.address === 'undefined') {
                res.status(401).send({ 'error': "Bad address requested." });
                return;
            }
            /**
             * KINGSLAND SCHOOL OF BLOCKCHAIN | ENSURING THE FUTURE OF BLOCKCHAIN
                The Mining Process: Preparation
                    When a Miner requests a block for mining , the node prepares
                    o Creates the next block candidate : executes all pending transactions
                    and adds them in the block candidate + inserts a coinbase tx
                    o Calculates the block data hash and provides it to the miner
                    o The Node keeps a separate block candidate for each mining request
                        It holds map< blockDataHash  block>
                    o If a miner requests a block candidate again , the Node sends an
                    updated block (eventually holding more
                    o The Node will always return the latest block for mining , holding the
                    latest pending transactions (to collect maximum

                The Coinbase Transaction (Reward)
                    A special coinbase transaction is inserted before all transactions
                    in the candidate block, to transfer the block reward + fees
                        o The sender address, sender public key and signature are zeroes
                    { "from": "0000000000000000000000000000000000000000",
                      "to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
                      "value": 5000350, 
                      "fee": 0 , 
                      "dateCreated": "2018 02 10T17:53:48.972Z",
                      "data": "coinbase tx",
                      "senderPubKey": "000000000000000000000000000000000000…0000",
                      "transactionDataHash": "4dfc3e0ef89ed603ed54e47435a18b…176a",
                      "senderSignature": ["0000 000000 …0000", "0 00 000 0000 …0000"],
                      "minedInBlockIndex": 35, 
                      "transferSuccessful": true
                    }
                    The last two values are set by the miner.
                */

            // We should not send a block to be mined if there are no pending transactions.
            //if (this.blockchain.getTransactionPool().length === 0) {
            if (this.blockchain.getTransactionPool().length === 0) {
            //if (this.blockchain.getTransactionPool().length > 0) {

                let candidateBlock: Block = this.blockchain.createCandidateMinerBlock(req.params.address);
                if (this.blockchain.getMiningRequestMap().get(candidateBlock.blockDataHash) === undefined) {
                    // Add the new block to the mining request map.
                    console.log('HttpServer./mining/get-mining-job/:address is already in the mining request map.  Purge map.')
                    this.blockchain.purgeMiningRequestMap();
                }
                // Add the new block to the mining request map.
                let myBlock: GetMiningJobRequest = new GetMiningJobRequest();
                this.blockchain.getMiningRequestMap().set(candidateBlock.blockDataHash, candidateBlock);
                myBlock.blockDataHash = candidateBlock.blockDataHash;
                myBlock.difficulty = candidateBlock.difficulty;
                myBlock.expectedReward = candidateBlock.reward;
                myBlock.rewardAddress = candidateBlock.rewardAddress;
                myBlock.index = candidateBlock.index;
                myBlock.transactionsIncluded = candidateBlock.transactions.length;
                console.log('Returning: ', myBlock);
                res.send(myBlock);
            } else {
                console.log('No transactions for a block to mine.');
                res.status(400).send({ 'error': 'No transactions for a block to mine.' });
                //res.sendStatus(400);
            }
        });

        app.post('/mining/submit-mined-block', (req, res) => {
            /**
             * Processing a Mined Block
                Miners submit their mined block hash (+ date + nonce
                    o Node builds the mined block and propagates it through the network
                When a miner submits a proof of work hash (I believe this is the block.blockHash)
                    o The node finds the block candidate by its blockDataHash
                    o The node verifies the hash + its difficulty and builds the next block (How does one verify the hash?  What is meant by build the next block?)
                        o The block candidate is merged with the nonce + timestamp + hash
                Then if the block is still not mined , the chain is extended (What does this mean?)
                    o Sometimes other miners can be faster -> the mined block is expired
                Then all peers are notified about the new mined block
             */
            let rVal: ValidationMessage = new ValidationMessage();
            console.log(this.myHttpPort + ':POST /mining/submit-mined-block');
            console.log('body=', req.body);

            /**
             * find the mined block in the mining request map.
             */
            let candidateBlock: Block = this.blockchain.getMiningRequestMap().get(req.body.blockDataHash);
            if (candidateBlock.blockDataHash === undefined) {
                rVal.message = 'Block not found or already mined';
                res.status(404).send({ 'error': rVal.message });
            } else {
                // Append the mined block to the blockchain.
                let submitMinedBlock: SubmitBlockRequest = req.body;
                /**
                 * TODO: The node verifies the hash + its difficulty and builds the next block (How does one verify the hash?  What is meant by build the next block?)
                 */
                /**
                 * Recalculate the block hash
                 */
                // blockCandidate.blockDataHash = _block.blockDataHash;
                // blockCandidate.dateCreated = new Date();
                // blockCandidate.nonce = nonce;
                // while (done === false) {
                //     console.log('MinerService.mineTheBloc(): nonce=', nonce);
                //     blockCandidate.nonce = nonce;
                //     minedBlockHash = sha256(JSON.stringify(blockCandidate))
                let maxZeroString: string = "0".repeat(candidateBlock.difficulty + 1);
                let verifyBlock: VerifyBlock = new VerifyBlock();
                let verified: boolean = false;

                verifyBlock.blockDataHash = submitMinedBlock.blockDataHash;
                verifyBlock.dateCreated = submitMinedBlock.dateCreated;
                verifyBlock.nonce = submitMinedBlock.nonce;
                let _hash: string = sha256(JSON.stringify(verifyBlock));
                let _strStart: string = _hash.substr(0, candidateBlock.difficulty);
                console.log('HttpServer(): _strStart=', _strStart);
                if( _hash === submitMinedBlock.blockHash && _strStart === maxZeroString.substr(0, candidateBlock.difficulty)) {
                    verified = true;
                }
                if (verified) {
                    candidateBlock.blockHash = submitMinedBlock.blockHash;
                    candidateBlock.dateCreated = submitMinedBlock.dateCreated;
                    candidateBlock.nonce = submitMinedBlock.nonce;
                    // add the mined block to the blockchain.
                    this.blockchain.getBlockchain().push(candidateBlock); // This is build the next block
                    // purge the mining request map.
                    this.blockchain.purgeMiningRequestMap();
                    rVal.message = 'Block accepted, reward paid: ' + candidateBlock.reward + ' microcoins';
                    res.send(rVal);
                    // call the  `/peers/notify-new-block` to tell the other nodes that a new block has been mined.
                    this.p2p.broadcastLatestBlockToOtherNodes();
                } else {
                    /**
                     * Verification fails so chain gets extended.  What does this mean?
                     */
                    return res.status(404).send({'error': "Block not found or already mined"});
                    //res.status(404).send("Block not found or already mined");
                    //res.status(400).send({ 'error': 'No transactions for a block to mine.' });
                }

            }
        });

        app.listen(myHttpPort, () => {
            console.log('HttpServer listening http on port: ' + myHttpPort);
            this.myHttpPort = myHttpPort;
        });
    };
}