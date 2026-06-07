import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Chat() {
  const { user } = useAuth();
  const socketRef = useSocket();
  const location  = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on mount; auto-select if navigated with a conversationId.
  useEffect(() => {
    const targetId = location.state?.conversationId;
    api.get('/conversations')
      .then(res => {
        const convos = res.data ?? [];
        setConversations(convos);
        if (targetId) {
          const match = convos.find(c => c.id === targetId);
          if (match) setActiveConversation(match);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingConvos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When active conversation changes, load messages and join socket room
  useEffect(() => {
    if (!activeConversation) return;

    setLoadingMessages(true);
    api.get(`/conversations/${activeConversation.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingMessages(false));

    socketRef.current?.emit('join:conversation', activeConversation.id);

    return () => {
      socketRef.current?.emit('leave:conversation', activeConversation.id);
    };
  }, [activeConversation]);

  // Listen for new messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (msg) => {
      if (msg.conversationId === activeConversation?.id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('new:message', handler);
    return () => socket.off('new:message', handler);
  }, [activeConversation, socketRef.current]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || !activeConversation) return;
    socketRef.current?.emit('send:message', {
      conversationId: activeConversation.id,
      message: input.trim()
    });
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--color-background-tertiary)' }}>

      {/* Sidebar — conversation list */}
      <div style={{
        width: '300px', borderRight: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)', overflowY: 'auto'
      }}>
        <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>Bisedat</h2>
        </div>

        {loadingConvos && <p style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Duke ngarkuar...</p>}

        {!loadingConvos && conversations.length === 0 && (
          <p style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Nuk ka biseda ende.</p>
        )}

        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => setActiveConversation(conv)}
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              borderBottom: '0.5px solid var(--color-border-tertiary)',
              background: activeConversation?.id === conv.id ? 'var(--color-background-secondary)' : 'transparent'
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
              Biseda #{conv.id}
            </p>
            {conv.lastMessage && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {conv.lastMessage.message?.slice(0, 40)}...
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {!activeConversation ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Zgjidh një bisedë për të filluar</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '0.5px solid var(--color-border-tertiary)',
              background: 'var(--color-background-primary)'
            }}>
              <p style={{ margin: 0, fontWeight: 500 }}>Biseda #{activeConversation.id}</p>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loadingMessages && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Duke ngarkuar mesazhet...</p>}

              {messages.map((msg, i) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div key={msg.id ?? i} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '60%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: isOwn ? '#3266ad' : 'var(--color-background-secondary)',
                      color: isOwn ? '#fff' : 'var(--color-text-primary)',
                      fontSize: '14px'
                    }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '0.5px solid var(--color-border-tertiary)',
              background: 'var(--color-background-primary)',
              display: 'flex', gap: '8px'
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Shkruaj një mesazh..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}
              >
                Dërgo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}