import React, { useState, useRef } from 'react';
import { SendIcon, LoaderIcon, ImageIcon, XIcon } from './icons';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled: boolean;
    selectedImage: string | null;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, selectedImage, onImageSelect, onImageRemove }) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((text.trim() || selectedImage) && !disabled) {
            onSendMessage(text);
            setText('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    
    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
        // Reset file input to allow selecting the same file again
        e.target.value = '';
    };

    return (
        <div className="w-full">
            {selectedImage && (
                 <div className="mb-2 p-2 bg-gray-200/80 dark:bg-[#0D1117] rounded-xl border border-gray-300 dark:border-[#30363D] w-fit">
                    <div className="relative">
                        <img src={selectedImage} alt="Selected preview" className="h-20 w-20 rounded-md object-cover" />
                        <button 
                            onClick={onImageRemove} 
                            className="absolute -top-2 -right-2 p-0.5 bg-gray-700/80 text-white rounded-full hover:bg-red-500/90 transition-colors"
                            aria-label="Remove image"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="w-full flex items-center p-2 bg-gray-200/80 dark:bg-[#0D1117] backdrop-blur-md rounded-xl border border-gray-300 dark:border-[#30363D] shadow-lg">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    disabled={disabled}
                />
                <button
                    type="button"
                    onClick={handleImageButtonClick}
                    disabled={disabled}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    aria-label="Upload image for analysis"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AtmosVision AI, or upload an image..."
                    className="flex-grow bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none resize-none px-2 py-1.5"
                    rows={1}
                    disabled={disabled}
                />
                <button
                    type="submit"
                    disabled={disabled}
                    className="ml-2 p-2 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:bg-blue-600 enabled:hover:bg-blue-500"
                    aria-label="Send message"
                >
                    {disabled ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SendIcon className="w-5 h-5" />}
                </button>
            </form>
        </div>
    );
};

export default ChatInput;