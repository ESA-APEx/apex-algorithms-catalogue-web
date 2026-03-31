import Markdown from "react-markdown";

import { cn } from "@/lib/utils";

export interface ParameterDescriptionMarkdownProps {
  description: string;
  className?: string;
}

export const ParameterDescriptionMarkdown = ({
  description,
  className,
}: ParameterDescriptionMarkdownProps) => {
  return (
    <div className={cn("text-sm text-gray-300", className)}>
      <Markdown
        components={{
          a: ({ className: anchorClassName, ...props }) => (
            <a
              {...props}
              className={cn("underline underline-offset-2", anchorClassName)}
            />
          ),
          code: ({ className: codeClassName, ...props }) => (
            <code
              {...props}
              className={cn("bg-gray-700 rounded p-1 text-xs", codeClassName)}
            />
          ),
        }}
      >
        {description}
      </Markdown>
    </div>
  );
};