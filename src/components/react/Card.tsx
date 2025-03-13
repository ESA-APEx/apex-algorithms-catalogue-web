import * as React from 'react';

interface CardProps {
	title: string;
    type: string;
	body: string;
	href: string;
	labels?: string[];
    children?: React.ReactNode;
    maxDisplayedLabels?: number;
}

const truncateBody = (text: string, wordLimit = 20) => {
    const words = text.split(/\s+/);

    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + ' ...';
    }
    return text;
}


export const Card = (
    { 
        title, 
        type,  
        body, 
        href, 
        labels, 
        children,
        maxDisplayedLabels = 3,
    }: CardProps) => {
    const truncatedBody = truncateBody(body);
    const displayedLabels = labels?.slice(0, maxDisplayedLabels);
    const hiddenLabels = labels?.slice(maxDisplayedLabels - 1);

    return (
        <a href={href} data-testid='service-card'>
            <div className="card flex flex-col w-full h-full px-4 py-3 rounded-lg text-brand-teal-30 bg-brand-teal-10 min-h-64">
                <div className="card-header mb-2">
                    <span className="text-sm" data-testid='service-type'>{type}</span>
                </div>

                <h2 className="card-title text-lg font-extrabold text-brand-teal-80">
                    {title}
                </h2>

                <p className="card-content mt-2 text-brand-gray-50 flex-1">
                    {truncatedBody}
                </p>

                {children}

                {
                    displayedLabels?.length && (
                        <div className="card-labels">
                            <hr className="text-brand-teal-20 border my-3" />
                            <div className="flex flex-nowrap gap-2 overflow-hidden">
                                {
                                    displayedLabels.map((label) => (
                                        <span key={label} className="text-sm text-nowrap px-2 py-1 text-brand-teal-80 bg-white" data-testid='service-label'>{label}</span>
                                    ))
                                }
                                {
                                    hiddenLabels?.length ? 
                                    (
                                        <span className="text-sm text-nowrap px-1 py-1 text-brand-teal-80" data-testid='service-hidden-label'>+{hiddenLabels.length}</span>
                                    )
                                    : null
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </a>
    )
}