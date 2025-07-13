import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button'; // o usa Angular Material

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToMapa() {
    this.router.navigate(['/dashboard']);
  }

  goToCharts() {
    this.router.navigate(['/charts']);
  }
}
