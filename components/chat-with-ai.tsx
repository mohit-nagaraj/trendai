import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Markdown from 'react-markdown';

// Import ContentIdea type from the appropriate location
// If not exported, you may need to move the type to a shared types file
export interface ContentIdea {
    id: string;
    inspiration_id: string;
    title: string;
    description: string;
    hook?: string;
    visual_style?: string;
    content_angle?: string;
    target_audience?: string;
    predicted_performance_score?: number;
    rationale?: string;
    content_type?: string;
    platform?: string;
    tags?: string[] | Record<string, unknown> | null;
    is_starred?: boolean;
    created_at?: string;
    updated_at?: string;
}

type ChatMessage = { role: 'user' | 'ai'; content: string };

interface ChatWithAIProps {
    idea: ContentIdea;
    open: boolean;
    setOpen: (open: boolean) => void;
    refreshIdea: () => void;
    className?: string;
    style?: React.CSSProperties;
}

const ChatWithAI: React.FC<ChatWithAIProps> = ({ idea, open, setOpen, refreshIdea, className, style }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingUpdate, setPendingUpdate] = useState<ContentIdea | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages(msgs => [...msgs, { role: 'user', content: input }]);
        setInput('');
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/ideas/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ideaId: idea.id,
                    messages: [...messages, { role: 'user', content: input }],
                }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setMessages(msgs => [...msgs, { role: 'ai', content: data.aiMessage }]);
                if (data.updatedIdea) {
                    setPendingUpdate(data.updatedIdea);
                    refreshIdea(); // Refetch latest idea from parent
                }
            }
        } catch {
            setError('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={`max-w-2xl w-full p-2 overflow-hidden ${className || ''}`} style={style}>
                <DialogHeader>
                    <DialogTitle>Chat with AI</DialogTitle>
                    <DialogDescription>
                        Ask the AI to improve or modify this idea. The AI can update fields like the hook, rationale, etc.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col h-[36rem] bg-white border rounded-lg p-4 overflow-y-auto">
                    <div className="flex-1 overflow-y-auto mb-2" style={{ minHeight: '12rem' }}>
                        {messages.length === 0 && <div className="text-muted-foreground text-sm">Start the conversation about this idea.</div>}
                        {messages.map((msg, i) => (
                            <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
                                    <Markdown>{msg.content}</Markdown>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {loading && <div className="text-xs text-gray-400">AI is typing...</div>}
                        {error && <div className="text-xs text-red-500">{error}</div>}
                    </div>
                    <form className="flex gap-2 mt-auto" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                        <input
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            placeholder="Type your message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                    {pendingUpdate && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            <div>Idea updated!</div>
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(pendingUpdate, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatWithAI; 