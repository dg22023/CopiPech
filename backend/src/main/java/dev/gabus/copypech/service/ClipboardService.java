package dev.gabus.copypech.service;

import dev.gabus.copypech.entity.ClipboardEntry;
import dev.gabus.copypech.repository.ClipboardEntryRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate; // 1. Importa la clase para enviar mensajes
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClipboardService {
    private final ClipboardEntryRepository clipboardEntryRepository;
    private final SimpMessagingTemplate messagingTemplate; // 2. Inyecta el template para enviar mensajes

    // Inyección de dependencias a través del constructor
    public ClipboardService(ClipboardEntryRepository clipboardEntryRepository, SimpMessagingTemplate messagingTemplate) {
        this.clipboardEntryRepository = clipboardEntryRepository;
        this.messagingTemplate = messagingTemplate; // 3. Asigna el template inyectado
    }

    /**
     * Guarda un nuevo elemento en el historial del portapapeles.
     * @param deviceId El ID del dispositivo que envía el contenido.
     * @param contentType El tipo de contenido (ej. "text/plain").
     * @param content El contenido a guardar.
     * @return El objeto ClipboardEntry guardado.
     */

    public ClipboardEntry saveClipboardEntry(String deviceId, String contentType, String content) {
        ClipboardEntry entry = new ClipboardEntry();
        entry.setDeviceId(deviceId);
        entry.setContentType(contentType);
        entry.setContent(content);
        entry.setCreatedAt(LocalDateTime.now()); // Establece la fecha y hora actual
        
        ClipboardEntry savedEntry = clipboardEntryRepository.save(entry);
        
        // 4. NOTIFICAR A TODOS LOS CLIENTES CONECTADOS
        // Envía el objeto guardado a un destino del broker.
        // Los clientes que se suscriban a "/topic/clipboard-updates" recibirán este mensaje.
        messagingTemplate.convertAndSend("/topic/clipboard-updates", savedEntry);

        return savedEntry;
    }

    /**
     * Obtiene el historial reciente del portapapeles.
     * @return Una lista con las últimas 20 entradas del portapapeles.
     */
    public List<ClipboardEntry> getRecentHistory() {
        // Usa el método de consulta personalizado que definimos en el repositorio
        return clipboardEntryRepository.findTop20ByOrderByCreatedAtDesc();
    }
    
    /**
     * Obtiene el contenido más reciente del portapapeles.
     * @param contentType El tipo de contenido a buscar (ej. "text/plain").
     * @return La última entrada de ese tipo, o null si no existe.
     */
    public ClipboardEntry getLastEntryByContentType(String contentType) {
        return clipboardEntryRepository.findFirstByContentTypeOrderByCreatedAtDesc(contentType);
    }
    
}
