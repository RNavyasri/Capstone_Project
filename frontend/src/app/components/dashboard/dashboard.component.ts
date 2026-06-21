import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Account } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  account: Account | null = null;
  userName = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(stored);
    const accountId = Number(user?.id);

    this.account = user as Account;
    this.userName = user?.username || user?.accountHolderName || 'User';

    if (!Number.isNaN(accountId)) {
      this.api.getAccount(accountId).subscribe({
        next: (data) => {
          this.account = data;
          if (!this.userName && data.username) {
            this.userName = data.username;
          }
        },
        error: () => {
          this.account = user as Account;
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}