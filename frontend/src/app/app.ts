import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService, ClipboardEntry } from './clipboard'
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    BrowserModule,
    FormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit, OnDestroy {
  protected title = 'CopyPech';

  // Propiedades para mostrar en la UI
  currentClipboardContent: string = '';
  currentContentType: string = 'text/plain'; // Puedes cambiar esto para probar otros tipos
  clipboardHistory: ClipboardEntry[] = [];
  
  // Para el nuevo contenido que el usuario va a enviar
  newClipboardText: string = '';
  newClipboardDeviceId: string = 'MiDispositivoWeb'; // Un ID por defecto para tu app web
  
  private clipboardUpdatesSubscription: Subscription | undefined;

  constructor(private clipboardService: ClipboardService) {}

  ngOnInit(): void {
    // 1. Cargar el historial al iniciar el componente
    this.loadClipboardHistory();

    // 2. Cargar el último contenido (ej. texto plano) al iniciar
    this.loadLatestClipboardContent('text/plain');

    // 3. Suscribirse a las actualizaciones de WebSocket
    this.clipboardUpdatesSubscription = this.clipboardService.clipboardUpdates$.subscribe(entry => {
      if (entry) {
        console.log('AppComponent: Actualización de portapapeles en tiempo real recibida:', entry);
        // Puedes actualizar el contenido actual si es el tipo que te interesa
        if (entry.contentType === 'text/plain') {
          this.currentClipboardContent = entry.content;
          this.currentContentType = entry.contentType;
        }
        // Asegúrate de que el historial se actualice también
        this.updateHistoryWithNewEntry(entry);
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.clipboardUpdatesSubscription) {
      this.clipboardUpdatesSubscription.unsubscribe();
    }
    // Opcional: desconectar el WebSocket si solo se usa en este componente
    // this.clipboardService.disconnectWebSocket(); 
  }

  // --- Métodos para interactuar con el servicio ---

  loadClipboardHistory(): void {
    this.clipboardService.getClipboardHistory().subscribe({
      next: (entries) => {
        this.clipboardHistory = entries;
        console.log('Historial cargado:', this.clipboardHistory);
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
      }
    });
  }

  loadLatestClipboardContent(contentType: string): void {
    this.clipboardService.getLatestClipboardContent(contentType).subscribe({
      next: (entry) => {
        if (entry) {
          this.currentClipboardContent = entry.content;
          this.currentContentType = entry.contentType;
          console.log('Último contenido cargado:', entry);
        } else {
          this.currentClipboardContent = 'No hay contenido reciente de este tipo.';
          this.currentContentType = contentType;
          console.log('No se encontró último contenido para:', contentType);
        }
      },
      error: (err) => {
        console.error('Error al cargar el último contenido:', err);
        this.currentClipboardContent = 'Error al cargar el contenido.';
      }
    });
  }

  sendNewClipboardContent(): void {
    if (!this.newClipboardText.trim()) {
      alert('El contenido no puede estar vacío.');
      return;
    }

    const newEntry: ClipboardEntry = {
      deviceId: this.newClipboardDeviceId,
      contentType: 'text/plain', // Por simplicidad, siempre enviamos texto plano desde aquí
      content: this.newClipboardText
    };

    this.clipboardService.sendClipboardContent(newEntry).subscribe({
      next: (savedEntry) => {
        console.log('Contenido enviado y guardado:', savedEntry);
        // Opcional: el WebSocket ya lo actualizará, pero podrías refrescar manualmente el historial
        // this.loadClipboardHistory();
        this.newClipboardText = ''; // Limpiar el campo de texto
      },
      error: (err) => {
        console.error('Error al enviar contenido:', err);
        alert('Error al enviar contenido: ' + err.message);
      }
    });
  }

  // Método auxiliar para actualizar el historial sin recargar todo
  private updateHistoryWithNewEntry(newEntry: ClipboardEntry): void {
    // Agrega la nueva entrada al principio del historial
    this.clipboardHistory.unshift(newEntry);
    // Opcional: limitar el tamaño del historial si quieres mostrar solo los últimos 20
    if (this.clipboardHistory.length > 20) {
      this.clipboardHistory.pop(); // Elimina el elemento más antiguo
    }
  }
}
