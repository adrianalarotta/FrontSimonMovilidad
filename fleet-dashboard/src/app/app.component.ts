import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './dashboard/map/map.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fleet-dashboard';

  constructor(private router: Router) {}

  inicio() {
    this.router.navigate(['/']);
  }logout() {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
  goToMapa() {
    this.router.navigate(['/dashboard']);
  }

  goToCharts() {
    this.router.navigate(['/charts']);
  }
}
