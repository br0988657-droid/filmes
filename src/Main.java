import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner entrada = new Scanner(System.in);
        Chatbot cineAI = new Chatbot();

        System.out.println("🎬 Bem-vindo ao CINEAI!");
        System.out.println("Digite algo para conversar com a IA (ou 'sair' para encerrar):");

        while (true) {
            System.out.print("> ");
            String mensagem = entrada.nextLine();

            if (mensagem.equalsIgnoreCase("sair")) {
                System.out.println("Até logo! 👋");
                break;
            }

            String resposta = cineAI.processarMensagem(mensagem);
            System.out.println(resposta);
        }

        entrada.close();
    }
}
