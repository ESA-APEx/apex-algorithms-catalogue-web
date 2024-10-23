interface CardProps {
	title: string;
	body: string;
	href: string;
	labels?: string[];
}

export const Card = ({ title, body, href, labels }: CardProps) => {
    return (
        <a href={href}>
            <div className="card flex flex-col w-full h-full px-4 py-3 rounded-lg text-brand-teal-30 bg-brand-teal-10">
                <div className="card-header mb-2">
                    <span className="text-sm">OpenEO</span>
                </div>

                <h2 className="card-title text-lg font-extrabold text-brand-teal-80">
                    {title}
                </h2>

                <p className="card-content mt-2 text-brand-gray-50 flex-1">
                    {body}
                </p>

                {
                    labels?.length && (
                        <div className="card-labels">
                            <hr className="text-brand-teal-20 border my-3" />
                            <div className="flex flex-wrap gap-2">
                                {
                                    labels.map((label) => (
                                        <span className="text-sm px-2 py-1 text-brand-teal-80 bg-white">{label}</span>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </a>
    )
}