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
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password';
      return;
    }
    if (this.password.length < 10 || !/[A-Z]/.test(this.password) || !/[0-9]/.test(this.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
      this.error = 'Password must be at least 10 chars with 1 uppercase, 1 number, and 1 special character';
      return;
    }

    this.api.login(this.username, this.password).subscribe({
      next: (res) => {
        const account = res.account;
        sessionStorage.setItem('user', JSON.stringify(account));
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Invalid username or password';
      }
    });
  }
}