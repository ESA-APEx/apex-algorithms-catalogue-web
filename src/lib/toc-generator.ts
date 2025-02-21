import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from "unist-util-visit";
import type { ToCElement } from '../types/models/catalogue';
import type {Link} from "@/types/models/algorithm.ts";

export async function generateContentToC(markdown: string) {
    const processor = unified()
        .use(remarkParse)
        .use(tocCompiler);

    return await processor.process(markdown);
}

export function getLinksToc(links: Link[]): ToCElement[] {
    const elements: ToCElement[] = [];

    if (links.find(link => link.rel === 'preview')) {
        elements.push({
            depth: 1, id: "preview-information", title: "Preview"
        })
    }
    return elements;
}

export async function generateToC(markdown: string, links: Link[]): Promise<ToCElement[]> {
   const contentToc = (await generateContentToC(markdown)).result as ToCElement[];
   return [...contentToc, ...getLinksToc(links)];
}

function tocCompiler() {
    const compiler = (tree: any) => {
    const toc: ToCElement[] = [];

    visit(tree, 'heading', (node: any) => {
        const depth = node.depth;

        if (depth <= 2) {
            const title = node.children
                .filter((child: any) => child.type === 'text')
                .map((child: any) => child.value)
                .join('');
            const id = title.toLowerCase().trim().split(' ').join('-')

            toc.push({ depth, title, id: id });
        }
    });

    return toc;
  };

  // @ts-expect-error
  Object.assign(this, {Compiler: compiler})
}