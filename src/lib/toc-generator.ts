import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from "unist-util-visit";
import type { ToCElement } from '../types/models/catalogue';

export async function generateToC(markdown: string) {
    const processor = unified()
        .use(remarkParse)
        .use(tocCompiler);

    return await processor.process(markdown);
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