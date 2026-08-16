'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Sanitizes URLs to strictly permit safe protocols (http, https, mailto, relative routes).
 * Blocks dangerous schemes (javascript:, data:, vbscript:, file:, etc.)
 */
function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return undefined;
  }

  // Allow http, https, mailto, tel, relative links
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }

  return undefined;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Bold
          strong: ({ children }) => (
            <strong className="font-bold text-sanchay-navy-950">{children}</strong>
          ),
          // Italic
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          // Headings
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-extrabold text-sanchay-navy-950 mt-3 mb-1.5 pb-1 border-b border-slate-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-sanchay-navy-900 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-sanchay-navy-800 mt-2 mb-0.5">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-800 leading-relaxed">{children}</p>,
          // Unordered Bullet Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2.5 text-slate-700">
              {children}
            </ul>
          ),
          // Ordered Numbered Lists
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2.5 text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5 leading-snug">{children}</li>,
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-sanchay-gold-500 bg-sanchay-gold-50/60 pl-3 py-1.5 my-2 rounded-r-md text-slate-700 text-xs italic">
              {children}
            </blockquote>
          ),
          // Inline and Code Blocks
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = codeClassName?.includes('language-');
            if (isBlock) {
              return (
                <div className="my-2 rounded-lg bg-slate-900 text-slate-100 p-3 overflow-x-auto text-[11px] font-mono shadow-inner">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code
                className="bg-slate-100 text-sanchay-navy-900 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Sanitized Links
          a: ({ href, children }) => {
            const safeHref = sanitizeUrl(href);
            if (!safeHref) {
              return <span className="underline decoration-slate-400">{children}</span>;
            }
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sanchay-navy-700 hover:text-sanchay-navy-900 underline decoration-sanchay-gold-400 hover:decoration-sanchay-gold-600 transition-colors inline-flex items-center gap-0.5"
              >
                <span>{children}</span>
                <span className="text-[10px] no-underline">↗</span>
              </a>
            );
          },
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
              <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-100 font-bold text-slate-800">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-t border-slate-100 text-slate-700">{children}</td>,
          // Horizontal Rules
          hr: () => <hr className="my-3 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
