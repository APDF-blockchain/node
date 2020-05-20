export class Balance {
    public accountAddress: string;
    public confirmedBalance: number;
    public safeBalance: number;
    public pendingBalance: number;
    constructor() {
        this.accountAddress = '0000000000000000000000000000000000000000';
        this.confirmedBalance = 0;
        this.pendingBalance = 0;
        this.safeBalance = 0;
    }
}
