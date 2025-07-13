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
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private map: any;
  private markers: { [id: string]: any } = {};
  private userMovedMap = false;
  isAdmin: boolean = false;
  alertas: { [deviceId: string]: string } = {};


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  cerrarAlerta(deviceId: string) {
    delete this.alertas[deviceId];
  }
  
  get alertasKeys() {
    return Object.keys(this.alertas);
  }
  

  async ngOnInit() {
    console.log("🟢 ngOnInit ejecutado");

    this.isAdmin = this.authService.isAdmin();

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

    // 🔧 Detecta si el usuario movió o hizo zoom en el mapa
    this.map.on('dragstart zoomstart', () => {
      this.userMovedMap = true;
    });

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
      const maskedDeviceId = this.isAdmin
        ? device_id
      : device_id.replace(/^(.{4}).+(.{4})$/, '$1****$2');


      if (!this.map) return;

     const popupContent = `
      <b>Vehículo:</b> ${maskedDeviceId}<br>
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

        // Solo centra la vista la primera vez
        this.map.setView([lat, lon], 13);
      }
    
      if (this.isAdmin && alerta_combustible) {
        const alerta = `🚨 Vehículo ${device_id}: autonomía < 1h (${autonomia_horas}h), combustible: ${fuel_level} L.`;
        this.alertas[device_id] = alerta;
      }
      
    };
  }
}
