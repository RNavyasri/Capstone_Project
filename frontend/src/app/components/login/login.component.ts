import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  login() {
    const username = this.username.trim();
    const password = this.password.trim();

    if (!username && !password) {
      this.error = 'Please enter both username and password';
      return;
    }
    if (!username) {
      this.error = 'Please enter username';
      return;
    }
    if (!password) {
      this.error = 'Please enter password';
      return;
    }

    this.api.login(username, password).subscribe({
      next: (res) => {
        this.error = '';
        const account = res.account;
        sessionStorage.setItem('user', JSON.stringify(account));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const message = err?.error?.message || err?.message || 'Invalid username or password';
        this.error = message;
      }
    });
  }
}