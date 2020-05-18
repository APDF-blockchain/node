export class Transaction {
    public from: string;
    public to: string;
    public value: number;
    public fee: number;
    public dateCreated: Date;
    public data: string;
    public senderPubKey: string;
    public transactionDataHash: string;
    public senderSignature: string[] = [];
    public mindInBlockIndex: number;
    public tranferSuccessful: boolean;
    constructor() {

    }

}