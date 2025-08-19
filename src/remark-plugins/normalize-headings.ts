import { visit } from "unist-util-visit";

const max = 6;

export function RemarkNormalizeHeadings() {
  return (tree: any) => {
    const nodes: any = [];
    let h1Existed: boolean = false;

    visit(tree, "heading", (node) => {
      nodes.push(node);

      if (node.depth === 1) {
        h1Existed = true;
      }
    });

    if (h1Existed) {
      for (let index = 0; index < nodes.length; index++) {
        const heading = nodes[index];

        if (heading.depth < max) {
          heading.depth++;
        }
      }
    }
    return tree;
  };
}
