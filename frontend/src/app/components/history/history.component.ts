import { Component, OnInit } from '@angular/core';
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

  constructor(private api: ApiService, private router: Router) {}

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
        this.api.getTransactions(data.id).subscribe({
          next: (tx) => this.transactions = tx,
          error: () => {}
        });
      },
      error: () => this.router.navigate(['/login'])
    });
  }
}