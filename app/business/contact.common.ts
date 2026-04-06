import { z } from "zod";

const MIN_SUBMIT_TIME_MS = 3000;

const contactSchema = z.object({
  name: z.string().min(1, "Por favor, informe seu nome."),
  email: z.string().email("Por favor, informe um email válido."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 10 caracteres."),
  _gotcha: z.string().max(0),
  _timestamp: z.coerce.number(),
});

export { contactSchema, MIN_SUBMIT_TIME_MS };
