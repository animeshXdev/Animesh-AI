'use client';

import { useEffect, useRef, useState } from 'react';
import Message from '@/app/message';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/modeToggle';
import { ArrowDown } from 'lucide-react';

type ChatMessage = {
role: 'user' | 'ai';
text: string;
};

export default function Home() {
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [showScrollButton, setShowScrollButton] = useState(false);

const chatRef = useRef<HTMLDivElement>(null);
const lastUserRef = useRef<HTMLDivElement | null>(null);

// Load from localStorage
useEffect(() => {
const stored = localStorage.getItem('animesh-ai-chat');
if (stored) setMessages(JSON.parse(stored));
}, []);

// Save to localStorage
useEffect(() => {
localStorage.setItem('animesh-ai-chat', JSON.stringify(messages));
}, [messages]);

// Smart scroll: until last user message hits top
useEffect(() => {
const chatEl = chatRef.current;
const userEl = lastUserRef.current;

if (!chatEl || !userEl) return;  

const userTop = userEl.getBoundingClientRect().top;  
const containerTop = chatEl.getBoundingClientRect().top;  

const isUserAboveTop = userTop <= containerTop + 10;  

if (!isUserAboveTop) {  
  chatEl.scrollTo({  
    top: chatEl.scrollHeight,  
    behavior: 'smooth',  
  });  
}

}, [messages]);

// Show scroll-to-bottom button
useEffect(() => {
const el = chatRef.current;
if (!el) return;

const handleScroll = () => {  
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;  
  setShowScrollButton(!atBottom);  
};  

el.addEventListener('scroll', handleScroll);  
return () => el.removeEventListener('scroll', handleScroll);

}, []);

const scrollToBottom = () => {
chatRef.current?.scrollTo({
top: chatRef.current.scrollHeight,
behavior: 'smooth',
});
};

const sendMessage = async () => {
if (!input.trim() || isLoading) return;

const userMessage = { role: 'user' as const, text: input };  
const updatedMessages = [...messages, userMessage];  
setMessages(updatedMessages);  
setInput('');  
setIsLoading(true);  

try {  
  const res = await fetch('/api/chat', {  
    method: 'POST',  
    body: JSON.stringify({  
      message: input,  
      history: updatedMessages.map((msg) => ({  
        role: msg.role === 'user' ? 'user' : 'model',  
        parts: [{ text: msg.text }],  
      })),  
    }),  
  });  

  const reader = res.body?.getReader();  
  const decoder = new TextDecoder();  
  let done = false;  
  let aiText = '';  

  // Add placeholder for streaming message  
  setMessages((prev) => [...prev, { role: 'ai', text: '' }]);  

  while (!done) {  
    const { value, done: readerDone } = await reader!.read();  
    if (value) {  
      const chunk = decoder.decode(value, { stream: true });  
      aiText += chunk;  

      setMessages((prev) => {  
        const updated = [...prev];  
        updated[updated.length - 1] = { role: 'ai', text: aiText };  
        return updated;  
      });  
    }  
    done = readerDone;  
  }  
} catch (err) {  
  console.error('Streaming error:', err);  
  setMessages((prev) => [  
    ...prev,  
    { role: 'ai', text: '⚠️ Something went wrong.' },  
  ]);  
} finally {  
  setIsLoading(false);  
}

};

return (
<main className="flex flex-col h-screen relative">
{/* Header */}
<header className="relative p-4 border-b border-border bg-background text-center">
<div className="flex justify-between  mx-auto">
<h1 className="text-2xl font-semibold">🤖 Animesh AI</h1>
<div className='sm:absolute sm:right-28'>
<ModeToggle />
</div>
<div></div>

</div>  
    <Button  
      variant="ghost"  
      size="sm"  
      className="absolute right-4 top-4"  
      onClick={() => setMessages([])}  
    >  
      Clear Chat  
    </Button>  
  </header>  

  {/* Messages */}  
  <div  
    ref={chatRef}  
    className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted"  
  >  
    {messages.map((msg, i) => (  
      <div  
        key={i}  
        ref={msg.role === 'user' && i === messages.length - 2 ? lastUserRef : null}  
      >  
        <Message role={msg.role} text={msg.text} />  
      </div>  
    ))}  
    {isLoading && <Message role="ai" text="..." />}  
  </div>  

  {/* Scroll-to-bottom ⬇️ */}  
  {showScrollButton && (  
    <div className="absolute bottom-24 right-4 z-10">  
      <Button  
        onClick={scrollToBottom}  
        size="icon"  
        variant="secondary"  
        className="rounded-full shadow-md"  
      >  
        <ArrowDown className="w-5 h-5" />  
      </Button>  
    </div>  
  )}  

  {/* Input (sticky) */}  
  <div className="sticky bottom-0 p-4 border-t border-border bg-background z-20">  
    <div className="flex gap-2">  
      <Input  
        placeholder="Type your message..."  
        value={input}  
        onChange={(e) => setInput(e.target.value)}  
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}  
        className="flex-1"  
        disabled={isLoading}  
      />  
      <Button onClick={sendMessage} disabled={isLoading}>  
        {isLoading ? 'Thinking...' : 'Send'}  
      </Button>  
    </div>  
  </div>  
</main>

);
}

