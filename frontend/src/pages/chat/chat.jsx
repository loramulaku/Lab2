import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Header from '../../components/Header';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOtherName(conv, currentUserId) {
  const others = (conv.participants ?? []).filter(p => {
    const uid = p.userId ?? p.id;
    return uid !== currentUserId;
  });
  if (others.length === 0) return `Conversation #${conv.id}`;
  const other = others[0];
  const firstName = other.firstName ?? other.user?.firstName;
  const lastName  = other.lastName  ?? other.user?.lastName;
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ');
  return `Conversation #${conv.id}`;
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Reuse the single socket owned by NotificationContext — already connected,
  // avoids a second handshake and fixes the race where a fresh socket from
  // useSocket() might not be open yet when the message-listener effect runs.
  const { socketRef } = useNotifications();
  const location = useLocation();

  const [conversations, setConversations]       = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages]                 = useState([]);
  const [input, setInput]                       = useState('');
  const [loadingConvos, setLoadingConvos]       = useState(true);
  const [loadingMessages, setLoadingMessages]   = useState(false);
  const messagesEndRef = useRef(null);

  // ── Load conversations; auto-select from location.state or ?cid= param ──
  useEffect(() => {
    const stateId  = location.state?.conversationId;
    const paramCid = new URLSearchParams(location.search).get('cid');
    const targetId = stateId ?? (paramCid ? parseInt(paramCid) : null);

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

  // ── When active conversation changes, load its messages and join the room ──
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
  }, [activeConversation, socketRef]);

  // ── Listen for incoming messages (real-time) ──────────────────────────────
  // We capture activeConversation in a ref so the stable socket handler always
  // sees the current value without needing to be re-registered each time.
  const activeConvRef = useRef(activeConversation);
  useEffect(() => { activeConvRef.current = activeConversation; }, [activeConversation]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (msg) => {
      if (msg.conversationId === activeConvRef.current?.id) {
        setMessages(prev => [...prev, msg]);
      }
      // Also refresh conversation list so last-message preview updates
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId ? { ...c, lastMessage: msg } : c
      ));
    };

    socket.on('new:message', handler);
    return () => socket.off('new:message', handler);
  // socketRef is a stable ref object — only run once (on mount) since the
  // socket from NotificationContext is already connected before Chat mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll to bottom whenever messages update ─────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeConversation) return;
    socketRef.current?.emit('send:message', {
      conversationId: activeConversation.id,
      message: input.trim(),
    });
    setInput('');
  }, [input, activeConversation, socketRef]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <Header />

      <div className="flex mt-16 h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">

        {/* ── Sidebar — conversation list ───────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <p className="px-4 py-3 text-sm text-gray-400">Loading…</p>
            )}

            {!loadingConvos && conversations.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No conversations yet.</p>
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
              <p className="text-sm text-gray-400">Select a conversation to start</p>
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
                  <p className="text-sm text-gray-400">Loading messages…</p>
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
                  placeholder="Type a message…"
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
