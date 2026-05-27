import { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import messageService from '../../services/messageService';
import { formatRelativeTime } from '../../utils/format';

function ConversationList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="surface p-8 text-center h-full flex flex-col items-center justify-center">
        <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-700">No conversations yet</p>
        <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">
          Messages with candidates and recruiters will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const active = c.id === selectedId;
        const unread = c.unreadCount > 0;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                active ? 'bg-brand-50/80 border-l-2 border-l-brand-600' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                  {c.title ?? c.participantName ?? 'Conversation'}
                </p>
                {c.lastMessageAt && (
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {formatRelativeTime(c.lastMessageAt)}
                  </span>
                )}
              </div>
              {c.lastMessage && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.lastMessage}</p>
              )}
              {unread && (
                <span className="inline-flex mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-600 text-white">
                  {c.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MessageThread({ conversationId, conversations }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    messageService
      .getMessages(conversationId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load this conversation.'))
      .finally(() => setLoading(false));
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !conversationId) return;
    setSending(true);
    try {
      const sent = await messageService.sendMessage(conversationId, draft.trim());
      setMessages((prev) => [...prev, sent?.message ?? { id: Date.now(), message: draft, createdAt: new Date().toISOString() }]);
      setDraft('');
    } catch {
      /* API not wired — show inline hint */
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-700">Select a conversation</p>
        <p className="text-xs text-gray-500 mt-1">Choose a thread on the left to read and reply.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[24rem]">
      <div className="px-5 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-sm font-semibold text-gray-900">
          {conversation?.title ?? conversation?.participantName ?? 'Conversation'}
        </h2>
        {conversation?.subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{conversation.subtitle}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl w-2/3" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No messages in this thread yet. Say hello below.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.isMine
                  ? 'ml-auto bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              {m.message}
              {m.createdAt && (
                <p className={`text-[10px] mt-1 ${m.isMine ? 'text-brand-100' : 'text-gray-400'}`}>
                  {formatRelativeTime(m.createdAt)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          className="input-field flex-1"
        />
        <button type="submit" disabled={sending || !draft.trim()} className="btn-primary px-4">
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = () => {
    setLoading(true);
    setError('');
    messageService
      .getConversations()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setConversations(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => setError('Unable to load your messages right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        title="Messages"
        subtitle="Talk with candidates and hiring teams in one place."
        className="mb-6"
      />

      {error && (
        <PageError message={error} onRetry={loadConversations} className="mb-4" />
      )}

      <div className="surface overflow-hidden min-h-[32rem] grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r border-gray-100 max-h-64 lg:max-h-none lg:overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        <MessageThread conversationId={selectedId} conversations={conversations} />
      </div>
    </SiteLayout>
  );
}
