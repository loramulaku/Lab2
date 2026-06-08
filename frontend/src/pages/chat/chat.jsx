import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Header from '../../components/Header';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOtherName(conv, currentUserId) {
  const others = (conv.participants ?? []).filter(p => {
    const uid = p.userId ?? p.id;
    return uid !== currentUserId;
  });
  if (others.length === 0) return `Bisedë #${conv.id}`;
  const other = others[0];
  const firstName = other.firstName ?? other.user?.firstName;
  const lastName  = other.lastName  ?? other.user?.lastName;
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ');
  return `Bisedë #${conv.id}`;
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Component ─────────────────────────────────────────────────────────────────

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
    <>
      <Header />

      {/* Full-height chat layout sitting directly below the fixed header */}
      <div className="flex mt-16 h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">

        {/* ── Sidebar — conversation list ───────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900">Bisedat</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <p className="px-4 py-3 text-sm text-gray-400">Duke ngarkuar...</p>
            )}

            {!loadingConvos && conversations.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">Nuk ka biseda ende.</p>
            )}

            {conversations.map(conv => {
              const isActive = activeConversation?.id === conv.id;
              const name     = getOtherName(conv, user?.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-l-2 border-l-blue-600'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                    {name}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {conv.lastMessage.message}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main chat area ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400">Zgjidh një bisedë për të filluar</p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {getOtherName(activeConversation, user?.id)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMessages && (
                  <p className="text-sm text-gray-400">Duke ngarkuar mesazhet...</p>
                )}

                {messages.map((msg, i) => {
                  const isOwn = Number(msg.senderId) === Number(user?.id);
                  return (
                    <div
                      key={msg.id ?? i}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col gap-0.5 max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-2 text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-t-2xl rounded-br-2xl rounded-bl-sm'
                        }`}>
                          {msg.message}
                        </div>
                        {msg.createdAt && (
                          <span className="text-xs text-gray-400 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="border-t border-gray-200 bg-white px-4 py-3 flex gap-2 flex-shrink-0">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Shkruaj një mesazh..."
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Dërgo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
