import React from 'react';
import { ChatMessage, GroundingChunk } from '../types';
import { BotIcon, UserIcon } from './icons';

const GroundingCitations: React.FC<{ chunks: GroundingChunk[] }> = ({ chunks }) => {
    // FIX: Cast the result of Array.from to GroundingChunk[] to fix a type inference issue where elements were being treated as `unknown`.
    const uniqueChunks = (Array.from(new Map(chunks.map(chunk => [(chunk.web?.uri || chunk.maps?.uri), chunk])).values()) as GroundingChunk[])
        .filter(c => c.web?.uri || c.maps?.uri);

    if (uniqueChunks.length === 0) return null;

    return (
        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Sources</h4>
            <ul className="space-y-1.5">
                {/* FIX: Updated logic to correctly select the source with a URI and handle optional properties. */}
                {uniqueChunks.map((chunk, index) => {
                    const source = chunk.web?.uri ? chunk.web : chunk.maps;
                    if (!source?.uri) return null;

                    return (
                        <li key={index} className="flex items-start text-xs">
                            <span className="text-gray-500 dark:text-gray-400 mr-2">{index + 1}.</span>
                            <a
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-600 dark:text-cyan-400 hover:underline break-all"
                                title={source.uri}
                            >
                                {source.title || source.uri}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


const formatMessage = (text: string) => {
  // Sanitize and apply bold tags first
  let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const lines = safeText.split('\n');
  let html = '';
  let currentListType: 'ol' | 'ul' | null = null;

  lines.forEach(line => {
    const trimmed = line.trim();

    // An empty line breaks out of any list.
    if (!trimmed) {
      if (currentListType) {
        if (currentListType === 'ol') html += '</ol>';
        if (currentListType === 'ul') html += '</ul>';
        currentListType = null;
      }
      return;
    }

    const isOlItem = /^\d+\.\s/.test(trimmed);
    const isUlItem = /^\*\s/.test(trimmed);

    // Handle headings
    if (trimmed.startsWith('### ')) {
      if (currentListType) {
        if (currentListType === 'ol') html += '</ol>';
        if (currentListType === 'ul') html += '</ul>';
        currentListType = null;
      }
      html += `<h3 class="font-semibold text-base mt-3 mb-1">${trimmed.substring(4)}</h3>`;
      return;
    }

    // Handle UL items
    if (isUlItem) {
      if (currentListType !== 'ul') {
        if (currentListType === 'ol') html += '</ol>'; // Close OL if open
        html += '<ul class="list-disc list-outside pl-5 space-y-1 mt-2">';
        currentListType = 'ul';
      }
      html += `<li>${trimmed.substring(2)}</li>`;
    } 
    // Handle OL items
    else if (isOlItem) {
      if (currentListType !== 'ol') {
        if (currentListType === 'ul') html += '</ul>'; // Close UL if open
        html += '<ol class="list-decimal list-outside pl-5 space-y-2 mt-1">';
        currentListType = 'ol';
      }
      html += `<li>${trimmed.substring(trimmed.indexOf('. ') + 2)}</li>`;
    } 
    // Handle paragraphs
    else {
      if (currentListType) {
        if (currentListType === 'ol') html += '</ol>';
        if (currentListType === 'ul') html += '</ul>';
        currentListType = null;
      }
      html += `<p class="my-1">${trimmed}</p>`;
    }
  });

  // Close any remaining list tags at the end
  if (currentListType) {
    if (currentListType === 'ol') html += '</ol>';
    if (currentListType === 'ul') html += '</ul>';
  }
  
  return html;
};


interface ChatPanelProps {
    messages: ChatMessage[];
    speakingMessageId?: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, speakingMessageId }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-full overflow-y-auto pr-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
            const isSpeaking = msg.id === speakingMessageId;
            return (
                <div key={msg.id} className={`flex items-start gap-3 message-enter ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>}
                    <div className={`p-3 rounded-lg max-w-sm sm:max-w-md lg:max-w-lg break-words prose-sm shadow-lg backdrop-blur-md text-left transition-all ${msg.role === 'model' ? 'bg-gray-200 text-gray-800 dark:bg-[#21262d] dark:text-gray-300' : 'bg-blue-600/90 text-white'} ${isSpeaking ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-gray-100 dark:ring-offset-[#161B22]' : ''}`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="User upload" className="mb-2 rounded-lg max-w-full h-auto" style={{ maxHeight: '200px' }} />
                        )}
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}></div>
                        {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                            <GroundingCitations chunks={msg.groundingChunks} />
                        )}
                    </div>
                    {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-white" /></div>}
                </div>
            );
        })}
        <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatPanel;