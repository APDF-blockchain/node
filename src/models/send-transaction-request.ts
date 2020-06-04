/**
 * @classdesc - data model for transaction being sent to this node.
 * @class SendTransactionRequest
 */
export class SendTransactionRequest {
    /**
     * @description - from address of the account from within a wallet.
     */
    public from: string;
    /**
     * @description - to address of an account in a wallet.
     */
    public to: string;
    /**
     * @description - the value of the transfer in microcoins
     */
    public value: number;
    /**
     * @description - the transaction fee paid by the from account
     */
    public fee: number;
    /**
     * @description - the date the transaction was created by the from account
     */
    public dateCreated: Date;
    /**
     * @description - a string holding some sort of description about the transaction, ie., Alice -> George
     */
    public data: string;
    /**
     * @description - the sender's public key (from account's key)
     */
    public senderPubKey: string;
    /**
     * @description - the sender's signature (from account signature)
     */
    public senderSignature: string[];

    /**
     * @constructor
     */
    constructor() {

    }
}