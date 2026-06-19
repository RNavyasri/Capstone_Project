import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-rewards',
  imports: [RouterLink],
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
  username = '';
  rewardPoints = 0;
  lastUpdated = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }
    const user = JSON.parse(stored);
    this.username = user.username;
    this.api.getRewards(this.username).subscribe({
      next: (data) => {
        this.rewardPoints = data.rewardPoints;
        this.lastUpdated = data.lastUpdated;
      },
      error: () => {
        this.rewardPoints = 0;
      }
    });
  }
}