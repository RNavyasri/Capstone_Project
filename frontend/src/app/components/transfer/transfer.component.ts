import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-transfer',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent {
  senderId = '';
  receiverId = '';
  amount = '';
  description = '';
  message = '';
  isError = false;
  isSubmitting = false;
  showDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  dialogType: 'success' | 'error' = 'success';

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    if (this.isSubmitting) {
      return;
    }

    this.message = '';
    this.showDialog = false;

    const senderId = Number(this.senderId);
    const receiverId = Number(this.receiverId);
    const amount = Number(this.amount);

    if (!this.senderId || !this.receiverId || !this.amount) {
      this.message = 'Please fill all required fields';
      this.isError = true;
      return;
    }

    if (!Number.isFinite(senderId) || !Number.isFinite(receiverId) || !Number.isFinite(amount) || amount <= 0) {
      this.message = 'Please enter valid transfer details';
      this.isError = true;
      return;
    }

    if (senderId === receiverId) {
      this.message = 'Sender and receiver account cannot be the same';
      this.isError = true;
      return;
    }

    this.isSubmitting = true;
    this.message = 'Processing transfer...';
    this.isError = false;

    this.api.transfer(senderId, receiverId, amount, this.description)
      .pipe(
        timeout(12000),
        catchError((err) => {
          let detailedMessage = 'Unable to connect to server. Please try again.';

          if (err.status === 400 && err.error?.message) {
            detailedMessage = err.error.message;
          } else if (err.name === 'TimeoutError') {
            detailedMessage = 'The server took too long to respond. Please try again later.';
          }

          this.isSubmitting = false;
          this.message = detailedMessage;
          this.isError = true;
          this.openDialog(
            'Transfer failed',
            detailedMessage,
            'error'
          );
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.message = '';
          this.isError = false;
          this.openDialog(
            'Transfer successful',
            res.message || 'The transfer was completed successfully.',
            'success'
          );
          this.senderId = '';
          this.receiverId = '';
          this.amount = '';
          this.description = '';
        },
        error: () => {
          // error already handled in catchError
        }
      });
  }

  openDialog(title: string, message: string, type: 'success' | 'error') {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.dialogType = type;
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
  }
}