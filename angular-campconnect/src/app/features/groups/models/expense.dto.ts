export interface GroupBalances {
    balances: { [userId: string]: number }; // Negative means owes, Positive means owed
    details: BalanceDetail[];
}

export interface BalanceDetail {
    fromUserId: string;
    toUserId: string;
    amount: number;
}
