import { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "O que é o P.A.G.O.?",
  "Quais são os 4 pilares?",
  "Como funciona a mentoria?",
  "O que vem no kit?",
];

export default function PagoChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente do P.A.G.O. — Novo Tempo. Posso ajudar com dúvidas sobre a mentoria, os 4 pilares (Princípio, Alinhamento, Governo e Obediência) e como iniciar sua jornada de transformação. Como posso ajudá-lo?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.chat.sendMessage.useMutation();

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({ message: messageText });
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Desculpe, não consegui processar sua mensagem no momento. Por favor, tente novamente ou entre em contato pelo formulário de inscrição.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: "#1A2744" }}
            aria-label="Abrir chat"
          >
            <MessageCircle size={24} style={{ color: "#B8A88A" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl shadow-2xl overflow-hidden flex flex-col border"
            style={{
              backgroundColor: "#FAFAF8",
              borderColor: "rgba(26,39,68,0.1)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ backgroundColor: "#1A2744" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(184,168,138,0.2)" }}
                >
                  <Bot size={18} style={{ color: "#B8A88A" }} />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold" style={{ color: "#FAFAF8" }}>
                    Assistente P.A.G.O.
                  </p>
                  <p className="text-xs" style={{ color: "rgba(250,250,248,0.5)" }}>
                    Sempre disponível
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
                style={{ color: "rgba(250,250,248,0.6)" }}
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                    }`}
                    style={
                      msg.role === "user"
                        ? { backgroundColor: "#1A2744", color: "#FAFAF8" }
                        : { backgroundColor: "rgba(232,224,212,0.4)", color: "#1A2744" }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3"
                    style={{ backgroundColor: "rgba(232,224,212,0.4)" }}
                  >
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#B8A88A", animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#B8A88A", animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#B8A88A", animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions - only show at start */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-accent uppercase tracking-[0.15em]" style={{ color: "rgba(26,39,68,0.4)" }}>
                    Perguntas frequentes
                  </p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="block w-full text-left text-sm px-3 py-2 rounded-lg border transition-all hover:shadow-sm"
                      style={{
                        borderColor: "rgba(26,39,68,0.1)",
                        color: "#1A2744",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="flex-shrink-0 px-4 py-3 border-t"
              style={{ borderColor: "rgba(26,39,68,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-1 disabled:opacity-50"
                  style={{
                    backgroundColor: "rgba(232,224,212,0.2)",
                    borderColor: "rgba(26,39,68,0.1)",
                    color: "#1A2744",
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-30"
                  style={{ backgroundColor: "#1A2744" }}
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} style={{ color: "#B8A88A" }} />
                </button>
              </div>
              <p className="text-center text-[10px] mt-2" style={{ color: "rgba(26,39,68,0.3)" }}>
                Assistente P.A.G.O. — Respostas baseadas na metodologia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
