import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Header from '../../components/Header';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOtherParticipant(conv, currentUserId) {
  const others = (conv.participants ?? []).filter(p => (p.userId ?? p.id) !== currentUserId);
  return others[0] ?? null;
}

function getOtherName(conv, currentUserId) {
  const other = getOtherParticipant(conv, currentUserId);
  if (!other) return `Conversation #${conv.id}`;
  const first = other.firstName ?? other.user?.firstName;
  const last  = other.lastName  ?? other.user?.lastName;
  return [first, last].filter(Boolean).join(' ') || `Conversation #${conv.id}`;
}

function formatMessageTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function dateDividerLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth()    === db.getMonth()    &&
         da.getDate()     === db.getDate();
}

const TINTS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500',  'bg-violet-500',
  'bg-teal-500',  'bg-cyan-500',  'bg-pink-500',
];
function tint(name) {
  const key = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TINTS[key % TINTS.length];
}
function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function Avatar({ name, size = 'md' }) {
  const sz = size === 'lg' ? 'w-10 h-10 text-sm' : size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-8 h-8 text-xs';
  return (
    <span className={`flex-shrink-0 ${sz} rounded-full ${tint(name)} flex items-center justify-center font-semibold text-white`}>
      {initials(name)}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socketRef } = useNotifications();
  const location = useLocation();

  const [conversations, setConversations]   = useState([]);
  const [activeConv,    setActiveConv]      = useState(null);
  const [messages,      setMessages]        = useState([]);
  const [input,         setInput]           = useState('');
  const [loadingConvos, setLoadingConvos]   = useState(true);
  const [loadingMsgs,   setLoadingMsgs]     = useState(false);
  const [search,        setSearch]          = useState('');
  const [unread,        setUnread]          = useState({}); // { [convId]: count }

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const activeConvRef  = useRef(activeConv);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // ── Load conversations ────────────────────────────────────────────────────
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
          if (match) setActiveConv(match);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingConvos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load messages when conversation changes ───────────────────────────────
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    api.get(`/conversations/${activeConv.id}/messages`)
      .then(res => setMessages(res.data ?? []))
      .catch(err => console.error(err))
      .finally(() => setLoadingMsgs(false));

    setUnread(prev => ({ ...prev, [activeConv.id]: 0 }));
    socketRef.current?.emit('join:conversation', activeConv.id);
    inputRef.current?.focus();

    return () => socketRef.current?.emit('leave:conversation', activeConv.id);
  }, [activeConv, socketRef]);

  // ── Real-time incoming messages ───────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (msg) => {
      if (msg.conversationId === activeConvRef.current?.id) {
        setMessages(prev => [...prev, msg]);
      } else {
        setUnread(prev => ({ ...prev, [msg.conversationId]: (prev[msg.conversationId] ?? 0) + 1 }));
      }
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId ? { ...c, lastMessage: msg } : c
      ));
    };
    socket.on('new:message', handler);
    return () => socket.off('new:message', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeConv) return;
    socketRef.current?.emit('send:message', { conversationId: activeConv.id, message: input.trim() });
    setInput('');
    inputRef.current?.focus();
  }, [input, activeConv, socketRef]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Filtered conversations ────────────────────────────────────────────────
  const filteredConvos = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => getOtherName(c, user?.id).toLowerCase().includes(q));
  }, [conversations, search, user?.id]);

  // ── Message grouping: inject date dividers + track sequences ─────────────
  const enrichedMessages = useMemo(() => {
    const out = [];
    let lastDate = null;
    let lastSenderId = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const ts  = msg.createdAt;

      if (!lastDate || !isSameDay(lastDate, ts)) {
        out.push({ type: 'divider', label: dateDividerLabel(ts), key: `div-${i}` });
        lastDate = ts;
        lastSenderId = null;
      }

      const isOwn      = Number(msg.senderId) === Number(user?.id);
      const sameAsPrev = msg.senderId === lastSenderId;
      const nextMsg    = messages[i + 1];
      const isLastInSeq = !nextMsg || nextMsg.senderId !== msg.senderId || !isSameDay(ts, nextMsg.createdAt);

      out.push({
        type: 'message',
        msg,
        isOwn,
        showAvatar: !isOwn && isLastInSeq,
        isFirst: !sameAsPrev,
        isLast: isLastInSeq,
        key: msg.id ?? `msg-${i}`,
      });

      lastSenderId = msg.senderId;
    }
    return out;
  }, [messages, user?.id]);

  const activeName = activeConv ? getOtherName(activeConv, user?.id) : '';

  return (
    <>
      <Header />

      <div className="flex mt-16 h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-gray-900">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">

          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-sm font-bold text-gray-900">Messages</h2>
          </div>

          <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <div className="px-4 py-8 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingConvos && filteredConvos.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  {search ? 'No results' : 'No conversations'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {search ? 'Try a different name' : 'Messages will appear here'}
                </p>
              </div>
            )}

            {filteredConvos.map(conv => {
              const isActive = activeConv?.id === conv.id;
              const name     = getOtherName(conv, user?.id);
              const badge    = unread[conv.id] ?? 0;
              const lastMsg  = conv.lastMessage;
              const lastTime = lastMsg?.createdAt ?? conv.createdAt;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors border-b border-gray-50 ${
                    isActive
                      ? 'bg-blue-50 border-l-2 border-l-blue-600'
                      : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={name} size="md" />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className={`text-sm truncate ${badge > 0 ? 'font-bold text-gray-900' : isActive ? 'font-semibold text-blue-700' : 'font-medium text-gray-800'}`}>
                        {name}
                      </p>
                      {lastTime && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatConvTime(lastTime)}</span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={`text-xs truncate mt-0.5 ${badge > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {Number(lastMsg.senderId) === Number(user?.id) ? 'You: ' : ''}{lastMsg.message}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main chat ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-800">Your messages</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Select a conversation on the left to start chatting.
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0 shadow-sm">
                <Avatar name={activeName} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activeName}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-0.5">
                {loadingMsgs && (
                  <div className="flex justify-center py-10">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}

                {!loadingMsgs && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Avatar name={activeName} size="lg" />
                    <p className="text-sm font-semibold text-gray-700 mt-3">{activeName}</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
                  </div>
                )}

                {enrichedMessages.map(item => {
                  if (item.type === 'divider') {
                    return (
                      <div key={item.key} className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap px-1">{item.label}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    );
                  }

                  const { msg, isOwn, showAvatar, isFirst, isLast } = item;

                  return (
                    <div
                      key={item.key}
                      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}
                    >
                      {!isOwn && (
                        <div className="w-7 flex-shrink-0 self-end mb-0.5">
                          {showAvatar && <Avatar name={activeName} size="sm" />}
                        </div>
                      )}

                      <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3.5 py-2 text-sm leading-relaxed break-words ${
                          isOwn
                            ? `bg-blue-600 text-white shadow-sm ${isFirst ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLast ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-md'}`
                            : `bg-white border border-gray-200 text-gray-800 shadow-sm ${isFirst ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLast ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-md'}`
                        }`}>
                          {msg.message}
                        </div>
                        {isLast && msg.createdAt && (
                          <span className="text-[10px] text-gray-400 px-1">{formatMessageTime(msg.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-end gap-3 flex-shrink-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 resize-none overflow-hidden bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4 translate-x-px" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
