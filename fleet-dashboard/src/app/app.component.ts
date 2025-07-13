import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './dashboard/map/map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fleet-dashboard';
}
