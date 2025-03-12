import { useState } from 'react';

interface CollapsibleTextProps {
    text: string
    maxLength?: number
}

export const CollapsibleText = ({ text, maxLength = 250 }: CollapsibleTextProps) => {
    const [showDetail, setShowDetail] = useState<boolean>(text.length <= maxLength);
    const displayedText = showDetail ? text : `${text.slice(0, maxLength)}...`;

    return (
        <p className="inline-block break-words">
            {displayedText}
            {
                showDetail ? 
                    null :
                    (
                        <button 
                            className="align-baseline ml-2 text-sm text-gray-300"
                            onClick={() => setShowDetail((value) => !value)}>
                            Read more
                        </button>
                    )
            }
        </p>
    )
}