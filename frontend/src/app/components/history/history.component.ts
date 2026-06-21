import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Account, TransactionLog } from '../../models';

@Component({
  selector: 'app-history',
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  transactions: TransactionLog[] = [];
  account: Account | null = null;
  totalAmount = 0;
  totalRewards = 0;
  latestActivity = 'No data';

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const stored = sessionStorage.getItem('user');

    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(stored);

    this.api.getAccount(user.id).subscribe({
      next: (data) => {
        this.account = data;

        console.log("Account:", data);

        this.api.getTransactions(data.id).subscribe({
          next: (tx) => {
            console.log("Transactions:", tx);
            this.transactions = tx ?? [];
            this.totalAmount = this.transactions.reduce(
              (sum, item) => sum + (Number(item.amount) || 0),
              0
            );
            this.totalRewards = this.transactions.reduce(
              (sum, item) => sum + (Number(item.rewardsEarned) || 0),
              0
            );

            const latest = this.transactions
              .map((item) => new Date(item.createdAt))
              .filter((date) => !isNaN(date.getTime()))
              .sort((a, b) => b.getTime() - a.getTime())[0];

            this.latestActivity = latest
              ? this.formatDate(latest)
              : 'No data';

            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error fetching transactions:', err)
        });
      },
      error: (err) => {
        console.error('Error fetching account:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  getDirectionLabel(tx: TransactionLog): string {
    return this.account?.id === tx.fromAccount ? 'Debit' : 'Credit';
  }

  getTransactionTypeLabel(tx: TransactionLog): string {
    const type = tx.transactionType?.toUpperCase();
    if (type === 'DEBIT' || type === 'CREDIT') {
      return type.charAt(0) + type.slice(1).toLowerCase();
    }
    return this.getDirectionLabel(tx);
  }

  getDirectionClass(tx: TransactionLog): string {
    return this.account?.id === tx.fromAccount ? 'debit' : 'credit';
  }

  getStatusLabel(tx: TransactionLog): string {
    const status = tx.status?.toLowerCase();
    if (status === 'success') return 'Success';
    if (status === 'failure') return 'Failure';
    return 'Unknown';
  }

  getStatusClass(tx: TransactionLog): string {
    const status = tx.status?.toLowerCase();
    if (status === 'success') return 'success';
    if (status === 'failure') return 'failure';
    return 'unknown';
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
}