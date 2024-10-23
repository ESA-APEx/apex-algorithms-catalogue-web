import { visit } from "unist-util-visit";

const nodeTypes = ["link", "image"] as const;

export type NodeType = typeof nodeTypes[number];

const defaultReplacer = async (nodeType: NodeType, url: string) => url;

export function RemarkLinkRewrite(options = { replacer: defaultReplacer }) {
  const { replacer } = options;
  return async (tree: any) => {
    const nodes: any = [];

    visit(tree, (node) => {
      if (nodeTypes.includes(node.type)) {
        nodes.push(node);
      }
    });

    await Promise.all(
      nodes.map(async (node: any) => {
        node.url = await replacer(node.type, node.url);
      }),
    );
    return tree;
  };
}