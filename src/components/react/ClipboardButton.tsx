import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

export interface ClipboardIconProps {
    text: string
    resetDelay?: number
}

export const ClipboardButton = ({ text, resetDelay = 1000 }: ClipboardIconProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (!copied) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), resetDelay);
            }
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
        }
    };

    return (
        <button className="p-1 rounded-sm hover:bg-brand-teal-50/20" onClick={handleCopy}>
            {
                copied ?  <Check className="w-4 h-4 text-brand-teal-50" /> : <Clipboard className="w-4 h-4 text-brand-teal-50" />
            }
        </button>
    )
}