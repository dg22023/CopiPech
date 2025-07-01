import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from, map, catchError, of } from 'rxjs';
import SockJS from 'sockjs-client';
import { Stomp, Client, IFrame, IMessage } from '@stomp/stompjs'; // Asegúrate de importar IMessage

// Define la interfaz para el objeto ClipboardEntry
export interface ClipboardEntry {
  id?: number;
  deviceId: string;
  contentType: string;
  content: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  private readonly apiUrl = 'http://localhost:8080/api/clipboard';
  private readonly websocketUrl = 'http://localhost:8080/websocket';

  private stompClient: Client | undefined;
  private isConnected = false;
  private clipboardUpdateSubject = new BehaviorSubject<ClipboardEntry | null>(null);
  
  public clipboardUpdates$: Observable<ClipboardEntry | null> = this.clipboardUpdateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Puedes iniciar la conexión aquí o en un momento oportuno (ej. en OnInit de un componente principal)
    // Para simplificar, la dejaremos aquí por ahora.
    this.connectWebSocket();
  }

  // --- MÉTODOS REST (HTTP) ---
  sendClipboardContent(entry: ClipboardEntry): Observable<ClipboardEntry> {
    return this.http.post<ClipboardEntry>(this.apiUrl, entry);
  }

  getClipboardHistory(): Observable<ClipboardEntry[]> {
    return this.http.get<ClipboardEntry[]>(`${this.apiUrl}/history`);
  }
  
  getLatestClipboardContent(contentType: string): Observable<ClipboardEntry> {
    return this.http.get<ClipboardEntry>(`${this.apiUrl}/latest?contentType=${contentType}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          console.warn('No se encontró contenido para el tipo:', contentType);
          return of(null as any);
        }
        return of(error);
      })
    );
  }

  // --- MÉTODOS DE WEBSOCKET (STOMP) ---
  
  private connectWebSocket(): void {
    if (this.isConnected) {
      console.log('Already connected to WebSocket.');
      return;
    }

    const socket = new SockJS(this.websocketUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.reconnectDelay = 5000; // Reconectar cada 5 segundos si se pierde la conexión
    this.stompClient.debug = (msg: string) => console.log('STOMP Debug:', msg); // Opcional: para depuración 

    // Definir los callbacks de conexión y error
    if (this.stompClient) {
      this.stompClient.onConnect = (frame: IFrame) => { // 'frame' es el objeto de conexión STOMP
        console.log('WebSocket connected!', frame);
        this.isConnected = true;

        this.stompClient?.subscribe('/topic/clipboard-updates', (message: IMessage) => { // 'message' es el objeto de mensaje STOMP
          console.log('Received WebSocket message:', message.body);
          try {
            const clipboardEntry: ClipboardEntry = JSON.parse(message.body);
            this.clipboardUpdateSubject.next(clipboardEntry);
          } catch (e) {
            console.error('Error parsing WebSocket message:', e, message.body);
          }
        });
      };
    }

    this.stompClient.onStompError = (frame: IFrame) => {
      // Manejar errores STOMP, como errores de autenticación o autorización si los hubiera
      console.error('STOMP Error:', frame.headers['message'], frame.body);
      this.isConnected = false;
      // La reconexión automática ya está configurada con reconnectDelay
    };

    this.stompClient.onWebSocketError = (event: Event) => {
      // Manejar errores de la conexión WebSocket subyacente
      console.error('WebSocket connection error:', event);
      this.isConnected = false;
      // La reconexión automática ya está configurada con reconnectDelay
    };

    // Activar la conexión
    this.stompClient.activate();
  }

  // Opcional: desconectar explícitamente
  disconnectWebSocket(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log('WebSocket disconnected.');
    }
  }
}