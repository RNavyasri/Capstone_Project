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
    this.userName = user.username;
    this.api.getAccount(user.id).subscribe({
      next: (data) => this.account = data,
      error: () => this.router.navigate(['/login'])
    });
  }

  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}