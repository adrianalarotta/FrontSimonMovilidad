import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="logout()" style="position: absolute; top: 10px; right: 10px; z-index: 1000;">
      Cerrar sesión
    </button>

    <!-- 🔔 Alerta solo para admins -->
    <div *ngIf="isAdmin && alertas.length > 0" style="position: absolute; top: 60px; left: 10px; z-index: 1000; background: #f44336; color: white; padding: 10px; border-radius: 5px;">
      🚨 {{ alertas[alertas.length - 1] }}
    </div>

    <div id="map" style="height: 500px;"></div>
  `,
})
export class MapComponent implements OnInit {

  private map: any;
  private markers: { [id: string]: any } = {};
  isAdmin: boolean = false;
  alertas: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async ngOnInit() {
    console.log("🟢 ngOnInit ejecutado");

    this.isAdmin = this.authService.isAdmin(); // ✅ Método que debes tener en AuthService

    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet') as typeof import('leaflet');
      this.initMap(L);
      this.connectWebSocket(L);
    }
  }

  initMap(L: any) {
    const existingMap = L.DomUtil.get('map');
    if (existingMap && existingMap._leaflet_id) {
      existingMap._leaflet_id = null;
    }

    this.map = L.map('map').setView([4.60971, -74.08175], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  connectWebSocket(L: any) {
    console.log("🌐 Intentando conectar al WebSocket...");

    const socket = new WebSocket('ws://localhost:8000/ws/ubicacion/');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { device_id, lat, lon, fuel_level, temperature, alerta_combustible, autonomia_horas } = data;

      if (!this.map) return;

      const popupContent = `
        <b>Vehículo:</b> ${device_id}<br>
        <b>Combustible:</b> ${fuel_level} L<br>
        <b>Temperatura:</b> ${temperature}°C
      `;

      if (this.markers[device_id]) {
        this.markers[device_id]
          .setLatLng([lat, lon])
          .setPopupContent(popupContent);
      } else {
        const customIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([lat, lon], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(popupContent)
          .openPopup();

        this.markers[device_id] = marker;
      }

      // ✅ Muestra alerta solo si es admin y se activa la alerta
console.log("🧪 Datos recibidos:", {
  isAdmin: this.isAdmin,
  alerta_combustible,
  autonomia_horas,
  fuel_level,
  device_id
});

if (this.isAdmin && alerta_combustible) {
  const alerta = `🚨 Vehículo ${device_id}: autonomía < 1h (${autonomia_horas}h), combustible: ${fuel_level} L.`;
  console.log("✅ Mostrando alerta:", alerta);
  this.alertas.push(alerta);
} else {
  console.log("ℹ️ No se mostró alerta. Condiciones:", {
    isAdmin: this.isAdmin,
    alerta_combustible
  });
}


      this.map.setView([lat, lon], 13);
    };
  }
}
