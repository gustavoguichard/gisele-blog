import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Por favor, informe seu nome."),
  email: z.string().email("Por favor, informe um email válido."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 10 caracteres."),
});

export { contactSchema };
