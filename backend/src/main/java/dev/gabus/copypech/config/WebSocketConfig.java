package dev.gabus.copypech.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 1. Habilita el manejo de mensajes WebSocket con un broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 2. Configura un broker de mensajes en memoria.
        // Los clientes que se suscriban a destinos que comiencen con "/topic"
        // recibirán mensajes de este broker.
        registry.enableSimpleBroker("/topic");
        
        // 3. Establece el prefijo para los destinos de la aplicación.
        // Los mensajes que van desde el cliente a la aplicación deben comenzar con "/app".
        // Por ejemplo, un cliente enviará mensajes a "/app/send-content".
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 4. Registra el endpoint de WebSocket para la conexión.
        // Los clientes se conectarán a esta URL (ej. ws://localhost:8080/websocket).
        // También habilitamos CORS para el frontend de Angular.
        registry.addEndpoint("/websocket")
                .setAllowedOriginPatterns("http://localhost:4200", "http://127.0.0.1:4200")
                .withSockJS(); // 5. Habilita SockJS para soporte de navegadores más antiguos
    }
}
