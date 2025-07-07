/* eslint-disable @typescript-eslint/no-unused-vars */
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

type MessageProps = {
  role: 'user' | 'ai';
  text: string;
};

export default function Message({ role, text }: MessageProps) {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className={cn('w-full', role === 'user' ? 'flex justify-end' : 'flex justify-start')}>
      <div
        className={cn(
          'max-w-[90%] md:max-w-[75%] px-4 py-3 rounded-lg text-sm whitespace-pre-wrap break-words shadow-sm',
          role === 'user'
            ? 'bg-emerald-600 text-white'
            : 'bg-muted text-black dark:text-white'
        )}
      >
        <ReactMarkdown
          components={{
            // ✅ Properly typed inline code and block code
            code({  inline, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              const codeString = String(children ?? '').trim();

              if (inline) {
                return (
                  <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded" {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <div className="relative my-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(codeString)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <pre className="bg-black/90 text-white text-xs p-4 rounded-md overflow-x-auto">
                    <code {...props}>{codeString}</code>
                  </pre>
                </div>
              );
            },

            // ✅ Paragraphs
            p({ children }) {
              return <p className="mb-2 leading-relaxed">{children}</p>;
            },

            // ✅ Links
            a({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
