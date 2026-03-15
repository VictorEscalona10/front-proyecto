import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminChatPage() {
  const socketRef = useRef(null);
  // NUEVO: Un ref para mantener el ID actual sin romper los eventos del socket
  const activeChatIdRef = useRef(null); 

  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // Sincronizamos el estado de activeChat con el Ref
  useEffect(() => {
    activeChatIdRef.current = activeChat?.id;
  }, [activeChat]);

  /* ================= SOCKET INIT (Se ejecuta UNA sola vez) ================= */
  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      // Quitamos transports: ['websocket'] fijo para que Socket.io pueda hacer fallback 
      // a Polling si el servidor de Render está "despertando" y tarda un poco.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin conectado', socket.id);
      setConnected(true);

      socket.emit('get_my_chats', (res) => {
        console.log('Chats:', res);
        if (res?.success) setChats(res.chats);
      });
    });

    socket.on('disconnect', () => {
      console.log('Desconectado');
      setConnected(false);
    });

    socket.on('new_message', (msg) => {
      console.log('Nuevo mensaje', msg);
      // Usamos el Ref en lugar del estado para evitar el "stale closure"
      if (msg.chatId === activeChatIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Cleanup function
    return () => socket.disconnect();
  }, []); // <-- ARREGLO VACÍO: Solo conecta al montar el componente

  /* ================= SELECT CHAT ================= */
  const openChat = (chat) => {
    const socket = socketRef.current;
    if (!socket) return;

    setActiveChat(chat);
    setMessages([]); // Limpiamos la pantalla mientras carga

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

  /* ================= UI ================= */
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* CHAT LIST */}
      <aside style={{ width: 300, borderRight: '1px solid #ddd', padding: 10 }}>
        <h3>Chats ({chats.length})</h3>
        {!connected && <p style={{ color: 'red' }}>Desconectado. Reintentando...</p>}

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            style={{
              padding: 10,
              cursor: 'pointer',
              background: activeChat?.id === c.id ? '#eee' : 'transparent',
            }}
          >
            Chat #{c.id.slice(0, 6)}
            <br />
            <small>{c.status}</small>
          </div>
        ))}
      </aside>

      {/* CHAT AREA */}
      <main style={{ flex: 1, padding: 10 }}>
        {!activeChat ? (
          <p>Selecciona un chat</p>
        ) : (
          <>
            <h3>Chat #{activeChat.id.slice(0, 6)}</h3>

            <div style={{ height: '70vh', overflowY: 'auto', border: '1px solid #ddd', padding: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <b>{m.isAdmin ? 'Admin' : 'Cliente'}:</b> {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', marginTop: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()} // UX extra: enviar con Enter
                style={{ flex: 1 }}
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}