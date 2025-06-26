package dev.gabus.copypech.controller;

import dev.gabus.copypech.entity.ClipboardEntry;
import dev.gabus.copypech.service.ClipboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clipboard")
@CrossOrigin(origins = "http://localhost:4200") // Permite peticiones desde tu frontend de Angular
public class ClipboardController {
    private final ClipboardService clipboardService;

    // Inyección de dependencias a través del constructor
    public ClipboardController(ClipboardService clipboardService) {
        this.clipboardService = clipboardService;
    }

    /**
     * Endpoint para enviar nuevo contenido al portapapeles.
     * Recibe un objeto JSON con el contenido, tipo y ID del dispositivo.
     *
     * Ejemplo de JSON:
     * {
     * "deviceId": "desktop-pc",
     * "contentType": "text/plain",
     * "content": "Este es el texto copiado."
     * }
     */
    @PostMapping
    public ResponseEntity<ClipboardEntry> sendClipboardContent(@RequestBody ClipboardEntry newEntry) {
        // Validación básica
        if (newEntry.getDeviceId() == null || newEntry.getContent() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Guarda el contenido usando el servicio
        ClipboardEntry savedEntry = clipboardService.saveClipboardEntry(
            newEntry.getDeviceId(),
            newEntry.getContentType(),
            newEntry.getContent()
        );

        // Devuelve el objeto guardado con el estado HTTP 201 Created
        return ResponseEntity.status(201).body(savedEntry);
    }

    /**
     * Endpoint para obtener el historial reciente del portapapeles.
     * Devuelve una lista de las últimas entradas.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ClipboardEntry>> getClipboardHistory() {
        // Obtiene el historial reciente usando el servicio
        List<ClipboardEntry> history = clipboardService.getRecentHistory();
        
        // Devuelve la lista con el estado HTTP 200 OK
        return ResponseEntity.ok(history);
    }

    /**
     * Endpoint para obtener el contenido más reciente del portapapeles de un tipo específico.
     * Por ejemplo, para obtener el último texto copiado.
     */
    @GetMapping("/latest")
    public ResponseEntity<ClipboardEntry> getLatestClipboardContent(@RequestParam String contentType) {
        // Obtiene la última entrada por tipo de contenido
        ClipboardEntry latestEntry = clipboardService.getLastEntryByContentType(contentType);

        if (latestEntry == null) {
            // Si no se encuentra contenido, devuelve 404 Not Found
            return ResponseEntity.notFound().build();
        }

        // Devuelve el contenido con el estado HTTP 200 OK
        return ResponseEntity.ok(latestEntry);
    }
    
}
