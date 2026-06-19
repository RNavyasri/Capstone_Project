import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Reward, TransactionLog } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { username, password });
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  transfer(senderId: number, receiverId: number, amount: number, description: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/transfer`, {
      senderId,
      receiverId,
      amount,
      description
    });
  }

  getTransactions(id: number): Observable<TransactionLog[]> {
    return this.http.get<TransactionLog[]>(`${this.baseUrl}/transactions/${id}`);
  }

  getRewards(username: string): Observable<Reward> {
    return this.http.get<Reward>(`${this.baseUrl}/rewards/${username}`);
  }
}