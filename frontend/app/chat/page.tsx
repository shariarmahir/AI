'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chat, type ChatMessage } from '@/lib/api';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import EmergencyAlert from '@/components/EmergencyAlert';

interface DisplayMessage extends ChatMessage {
  confidence?: 'high' | 'medium' | 'low';
  emergency?: boolean;
}

function scoreToLabel(score: number | string): 'high' | 'medium' | 'low' {
  if (typeof score === 'string') return score as 'high' | 'medium' | 'low';
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m LifeGuard Nexus. You can ask me about symptoms, medicines, women\'s health, or anything health-related in Bangla or English.\n\nআপনি বাংলায় বা ইংরেজিতে স্বাস্থ্য বিষয়ে যেকোন প্রশ্ন করতে পারেন।',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: DisplayMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history: ChatMessage[] = newMessages
        .slice(0, -1)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));
      const res = await chat(input, history);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.reply,
          confidence: scoreToLabel(res.confidence),
          emergency: res.flagged_emergency ?? res.emergency,
        },
      ]);
    } catch (e: any) {
      const msg = e?.message || 'Unknown error';
      const isBilling = msg.toLowerCase().includes('credit') || msg.toLowerCase().includes('billing');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: isBilling
            ? 'The AI service is temporarily unavailable due to billing limits. Please contact the administrator.'
            : `Sorry, something went wrong: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="eyebrow mb-2"><Sparkles className="w-3 h-3" /> AI Assistant</div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">Chat with LifeGuard Nexus</h1>
        <p className="text-sm text-ink-500">Ask anything about symptoms, medications, or women's health.</p>
      </div>

      <div className="card !p-0 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex animate-fade-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${m.role === 'user' ? 'order-2' : ''}`}>
                {m.emergency && <div className="mb-2"><EmergencyAlert /></div>}
                <div className={`rounded-2xl px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-ink-950 text-white shadow-soft'
                    : 'bg-ink-50 text-ink-800 border border-ink-100'
                }`}>
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-inherit prose-strong:text-inherit">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
                {m.confidence && (
                  <div className="mt-1.5">
                    <ConfidenceBadge confidence={m.confidence} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-ink-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> LifeGuard Nexus is thinking…
            </div>
          )}
        </div>

        <div className="border-t border-ink-100 p-3 flex gap-2 bg-white/60">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your symptoms…"
            className="input"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-accent !px-4">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
