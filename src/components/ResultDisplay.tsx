import ReactMarkdown from "react-markdown";
import { Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../uikit/Button";

interface ResultDisplayProps {
  content: string;
}

export function ResultDisplay({ content }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-800">Your Story</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="p-6 md:p-8 prose prose-blue max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-2xl font-bold text-gray-900 mb-4"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-xl font-bold text-gray-800 mt-6 mb-3"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-lg font-bold text-gray-800 mt-4 mb-2"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="text-gray-600 leading-relaxed mb-4" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-gray-900" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul
                className="list-disc list-inside space-y-1 mb-4 text-gray-600"
                {...props}
              />
            ),
            li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
