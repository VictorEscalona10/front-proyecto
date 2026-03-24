import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './AdminChatPage.css'; // ¡Importante! Aquí conectamos los estilos

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminChatPage() {
  const socketRef = useRef(null);
  const activeChatIdRef = useRef(null); 

  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    activeChatIdRef.current = activeChat?.id;
  }, [activeChat]);

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin conectado', socket.id);
      setConnected(true);

      socket.emit('get_my_chats', (res) => {
        if (res?.success) setChats(res.chats);
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_message', (msg) => {
      if (msg.chatId === activeChatIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.disconnect();
  }, []); 

  /* ================= SELECT CHAT ================= */
  const openChat = (chat) => {
    const socket = socketRef.current;
    if (!socket) return;

    setActiveChat(chat);
    setMessages([]); 

    socket.emit('join_chat', { chatId: chat.id }, () => {
      socket.emit('get_chat_messages', { chatId: chat.id }, (res) => {
        if (res?.success) setMessages(res.messages);
      });
    });
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    const socket = socketRef.current;
    if (!text.trim() || !activeChat) return;

    socket.emit(
      'send_message',
      { chatId: activeChat.id, text },
      (res) => {
        if (!res?.success) alert('Error enviando mensaje');
      }
    );

    setText('');
  };

  /* ================= UI ESTILIZADA ================= */
  return (
    <div className="admin-chat-page">
      {/* HEADER PRINCIPAL */}
      <header className="admin-chat-header">
        <h1>Panel de Mensajes</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'En línea y conectado' : 'Desconectado. Reintentando...'}
          </span>
        </div>
      </header>

      <div className="chat-container">
        {/* CHAT LIST */}
        <aside className="chats-list">
          <div className="chats-header">
            <h3>Bandeja de Entrada ({chats.length})</h3>
          </div>
          <div className="chats-list-content">
            {chats.length === 0 && <p className="no-chats">No hay chats activos</p>}
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => openChat(c)}
                className={`chat-item ${activeChat?.id === c.id ? 'active' : ''}`}
              >
                <div className="chat-client-info">
                  <div className="chat-client-name">
                    {c.clientName || `Cliente #${c.clientId}`}
                  </div>
                  <div className="chat-client-email">{c.clientEmail}</div>
                </div>
                
                <div className="chat-meta">
                  <span className={`chat-status ${c.status === 'active' ? 'active' : 'closed'}`}>
                    {c.status === 'active' ? 'Activo' : 'Cerrado'}
                  </span>
                  {c.messages && c.messages.length > 0 && (
                     <span className="chat-date">
                       {new Date(c.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  )}
                </div>
                {c.messages && c.messages.length > 0 && (
                  <div className="chat-last-message">
                    {c.messages[0].text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* CHAT AREA */}
        <main className="chat-area">
          {!activeChat ? (
            <div className="no-chat-selected">
              <p>Selecciona un chat en la lista para ver los mensajes</p>
            </div>
          ) : (
            <>
              <div className="chat-area-header">
                <h3>Chat con: {activeChat.clientName || `Cliente #${activeChat.clientId}`}</h3>
              </div>

              <div className="chat-messages-area">
                {messages.map((m, i) => {
                  const isAdminMsg = m.isAdmin;
                  return (
                    <div key={i} className={`message ${isAdminMsg ? 'admin' : 'client'}`}>
                      <div className="message-header">
                        <span className="message-sender">
                          {isAdminMsg ? 'Tú (Admin)' : (activeChat.clientName || 'Cliente')}
                        </span>
                        {m.createdAt && (
                          <span className="message-time">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="message-text">{m.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-container">
                <div className="chat-input-form">
                  <input
                    className="chat-input"
                    placeholder="Escribe un mensaje aquí..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                  />
                  <button 
                    className="chat-send-btn" 
                    onClick={sendMessage}
                    disabled={!text.trim()}
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}