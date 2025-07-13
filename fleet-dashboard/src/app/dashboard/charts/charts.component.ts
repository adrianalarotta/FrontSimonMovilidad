import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartRef?: ElementRef<HTMLCanvasElement>;
 
  constructor(private http: HttpClient) {}
  selectedDeviceId: string = '';
  deviceIds: string[] = [];


  ngOnInit(): void {
    this.loadInitialData();
  }
  private chart!: Chart;
  private socket!: WebSocket;

  private history: Record<string, { timestamps: string[], speed: number[], fuel: number[] }> = {};

  loadInitialData(): void {
    this.http.get<{ [device_id: string]: { timestamp: string, velocidad: number, fuel_level: number }[] }>(
      'http://localhost:8000/api/historico/'
    ).subscribe({
      next: (data) => {
        this.deviceIds = Object.keys(data);
        this.selectedDeviceId = this.deviceIds[0] || '';
  
        for (const device_id of this.deviceIds) {
          const registros = data[device_id];
          this.history[device_id] = {
            timestamps: registros.map(r => new Date(r.timestamp).toLocaleTimeString()),
            speed: registros.map(r => r.velocidad),
            fuel: registros.map(r => r.fuel_level)
          };
        }
  
        // Guardar en localStorage para uso offline
        localStorage.setItem('historialDispositivos', JSON.stringify(this.history));
        localStorage.setItem('listaDispositivos', JSON.stringify(this.deviceIds));
        localStorage.setItem('ultimoSeleccionado', this.selectedDeviceId);
  
        this.updateChart();
        this.connectWebSocket();
      },
      error: () => {
        console.warn(' Error al obtener datos desde el servidor. Intentando cargar desde cache local...');
        const cachedHistory = localStorage.getItem('historialDispositivos');
        const cachedDeviceIds = localStorage.getItem('listaDispositivos');
        const cachedSelected = localStorage.getItem('ultimoSeleccionado');
  
        if (cachedHistory && cachedDeviceIds) {
          this.history = JSON.parse(cachedHistory);
          this.deviceIds = JSON.parse(cachedDeviceIds);
          this.selectedDeviceId = cachedSelected || this.deviceIds[0] || '';
  
          console.log('✅ Cargando historial desde localStorage');
          this.updateChart();
        } else {
          console.error('❌ No se encontraron datos ni en el servidor ni en cache.');
        }
      }
    });
  }
  

  updateChart(): void {
    const h = this.history[this.selectedDeviceId];
    if (!h) return;
  
    this.chart.data.labels = [...h.timestamps];
    this.chart.data.datasets[0].data = [...h.speed];
    this.chart.data.datasets[1].data = [...h.fuel];
    this.chart.update();
  }
  
  
  ngAfterViewInit(): void {
    if (!this.chartRef?.nativeElement) {
      console.error('❌ No se encontró el canvas en el DOM.');
      return;
    }
    Chart.register(...registerables);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Velocidad (km/h)',
            data: [],
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Combustible (L)',
            data: [],
            borderColor: '#FFA726',
            backgroundColor: 'rgba(255, 167, 38, 0.2)',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Velocidad (km/h)' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Combustible (L)' },
            grid: { drawOnChartArea: false }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Histórico de Velocidad y Combustible'
          }
        }
      }
    });

  }

  connectWebSocket(): void {
    this.socket = new WebSocket('ws://localhost:8000/ws/ubicacion/');
    this.chart.update();

    // Actualizar cache local
    localStorage.setItem('historialDispositivos', JSON.stringify(this.history));

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { device_id, velocidad, fuel_level } = data;
  
      const timestamp = new Date().toLocaleTimeString();
  
      if (!this.history[device_id]) {
        this.history[device_id] = { timestamps: [], speed: [], fuel: [] };
      }
  
      const history = this.history[device_id];
      history.timestamps.push(timestamp);
      history.speed.push(velocidad);
      history.fuel.push(fuel_level);
  
      if (history.timestamps.length > 10) {
        history.timestamps.shift();
        history.speed.shift();
        history.fuel.shift();
      }
  
      if (device_id === this.selectedDeviceId) {
        this.updateChart();
      }
    };
  }
  

  ngOnDestroy(): void {
    if (this.socket) this.socket.close();
  }
}
