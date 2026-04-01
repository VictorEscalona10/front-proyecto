import React, { useState, useRef, useEffect } from 'react';
import './AdminBotChat.css';

export function AdminBotChat() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy tu asistente inteligente. ¿Tienes alguna duda sobre cómo usar el panel de administración?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Agregamos el mensaje del usuario a la vista
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Llamada al backend de NestJS que creamos
      const response = await fetch(`${API_URL}/admin-bot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error('Error en la comunicación con la IA');

      const data = await response.json();
      // Agregamos la respuesta de Gemini a la vista
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Hubo un error de conexión. Verifica que el backend esté encendido.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-bot-container">
      <div className="admin-bot-header">
        <h3>🤖 Asistente del Sistema</h3>
      </div>
      
      <div className="admin-bot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className={`message-bubble ${msg.role}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-bubble bot typing">Escribiendo...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="admin-bot-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda aquí..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}