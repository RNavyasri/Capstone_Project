export interface Account {
  id: number;
  accountHolderName: string;
  username: string;
  password?: string;
  status: 'ACTIVE' | 'CLOSED' | 'LOCKED';
  balance: number;
}

export interface TransactionLog {
  transactionId: number;
  fromAccount: number;
  toAccount: number;
  amount: number;
  transactionType: string;
  rewardsEarned: number;
  createdAt: string;
}

export interface Reward {
  id: number;
  username: string;
  rewardPoints: number;
  lastUpdated: string;
}
