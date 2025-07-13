import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

interface UbicacionData {
  device_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<UbicacionData>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:8000/ws/ubicacion/');
  }

  public getUbicaciones(): Observable<UbicacionData> {
    return this.socket$;
  }

  public closeConnection() {
    this.socket$.complete();
  }
}
