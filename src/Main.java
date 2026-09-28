import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/cinema")
@CrossOrigin(origins = "*") // Permite que seu HTML acesse o servidor Java
public class CinemaAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemaAiApplication.class, args);
    }

    // Modelo de dados para a mensagem
    static class ChatRequest {
        public String message;
        public String userId;
    }

    static class ChatResponse {
        public String reply;
        public ChatResponse(String reply) { this.reply = reply; }
    }

    // Endpoint que o Chatbot do HTML vai chamar
    @PostMapping("/chat")
    public ChatResponse handleChat(@RequestBody ChatRequest request) {
        String userMsg = request.message.toLowerCase();
        String responseText;

        // Lógica de IA simplificada em Java
        if (userMsg.contains("netflix") || userMsg.contains("analisa")) {
            responseText = "Sincronizando com seus dados da Netflix... 🔄 Vejo que você gosta de suspense. Recomendo 'Mindhunter'.";
        } else if (userMsg.contains("filme") || userMsg.contains("série")) {
            responseText = "Analisando seus gostos... 🧠 Minha sugestão para você hoje é 'Inception'.";
        } else {
            responseText = "Entendi! Você prefere algo mais emocionante ou algo para relaxar agora?";
        }

        return new ChatResponse(responseText);
    }

    // Simulação de Login
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", "skynet-token-12345");
        response.put("user", credentials.get("email"));
        return response;
    }
}
