import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

interface TreeNode {
    name: string;
    type: "file" | "directory";
    path: string;
    size?: number;
    extension?: string;
    children?: TreeNode[];
}

interface TreeResult {
    path: string;
    totalFiles: number;
    totalDirectories: number;
    tree: TreeNode[];
}

const defaultExcludePatterns = [".git", "node_modules", ".next", "dist", "build", ".vscode", ".idea", "coverage", ".nyc_output"];

const shouldExclude = (name: string, excludePatterns: string[]): boolean => {
    return excludePatterns.some(pattern => {
        if (pattern.includes("*")) {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(name);
        }
        return name === pattern || name.startsWith(pattern);
    });
}

const getFileExtension = (fileName: string): string => {
    const extension = path.extname(fileName);
    return extension || "";
}

const buildTree = async (dirPath: string, maxDepth: number, includeFiles: boolean, excludePatterns: string[], currentDepth: number = 0): Promise<{
    nodes: TreeNode[];
    fileCount: number;
    dirCount: number;
}> => {
    if (currentDepth >= maxDepth) {
        return {nodes: [], fileCount: 0, dirCount: 0};
    }

    let fileCount = 0;
    let dirCount = 0;
    const nodes: TreeNode[] = [];

    try {
        const items = await fs.readdir(dirPath, {withFileTypes: true});

        items.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

        for (const item of items) {
            if (shouldExclude(item.name, excludePatterns)) {
                continue;
            }

            const itemPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                dirCount++;
                const {
                    nodes: children,
                    fileCount: childFiles,
                    dirCount: childDirs
                } = await buildTree(itemPath, maxDepth, includeFiles, excludePatterns, currentDepth + 1);
                fileCount += childFiles;
                dirCount += childDirs;

                nodes.push({
                    name: item.name,
                    type: "directory",
                    path: itemPath,
                    children: children,
                });
            } else if (includeFiles) {
                fileCount++;
                const stats = await fs.stat(itemPath);

                nodes.push({
                    name: item.name,
                    type: "file",
                    path: itemPath,
                    size: stats.size,
                    extension: getFileExtension(item.name),
                });
            }
        }
    } catch (error: any) {
    }

    return {nodes, fileCount, dirCount};
}

const generateVisualTree = (nodes: TreeNode[], prefix: string = "", isLast: boolean = true): string => {
    let result = "";

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isLastItem = i === nodes.length - 1;
        const connector = isLastItem ? "└── " : "├── ";
        const displayName = node.type === "directory" ? `${node.name}/` : node.name;

        result += `${prefix}${connector}${displayName}\n`;

        if (node.children && node.children.length > 0) {
            const childPrefix = prefix + (isLastItem ? "    " : "│   ");
            result += generateVisualTree(node.children, childPrefix, false);
        }
    }

    return result;
};

const directoryTree = async (dirPath: string = ".", maxDepth: number = 3, includeFiles: boolean = true, excludePatterns: string[] = defaultExcludePatterns, format: "visual" | "json" | "both" = "visual") => {
    const fullPath = await resolvePath(dirPath, 'read');
    const {nodes, fileCount, dirCount} = await buildTree(fullPath, maxDepth, includeFiles, excludePatterns);

    const result: TreeResult = {
        path: fullPath,
        totalFiles: fileCount,
        totalDirectories: dirCount,
        tree: nodes,
    }

    switch (format) {
        case "json":
            return JSON.stringify(result, null, 2);

        case "visual":
            const baseName = path.basename(fullPath);
            const visualTree = generateVisualTree(nodes);
            return `${baseName}/\n${visualTree}\nFiles: ${fileCount}, Directories: ${dirCount}`;

        case "both":
            const baseNameBoth = path.basename(fullPath);
            const visualTreeBoth = generateVisualTree(nodes);
            const visual = `${baseNameBoth}/\n${visualTreeBoth}\nFiles: ${fileCount}, Directories: ${dirCount}`;
            const json = JSON.stringify(result, null, 2);
            return `=== VISUAL TREE ===\n${visual}\n\n=== JSON STRUCTURE ===\n${json}`;

        default:
            throw new Error(`Invalid format: ${format}`);
    }
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.directoryTree,
        "Generates a hierarchical tree view of directory structure with customizable depth and filtering options",
        {
            dirPath: z.string().optional().describe("Absolute or base-relative path to the directory. Defaults to current directory"),
            maxDepth: z.number().optional().describe("Maximum depth to traverse (default: 3). Use 1 for current level only"),
            includeFiles: z.boolean().optional().describe("Include files in the tree output (default: true). Set false for directories only"),
            excludePatterns: z.array(z.string()).optional().describe("Array of patterns to exclude (default: ['.git', 'node_modules', '.next', 'dist', 'build']). Supports wildcards with *"),
            format: z.enum(["visual", "json", "both"]).default('visual').describe("Output format: 'visual' for tree diagram, 'json' for structured data, 'both' for combined output (default: 'visual')"),
        },
        async ({dirPath, maxDepth = 3, includeFiles = true, excludePatterns = defaultExcludePatterns, format}) => {
            try {
                const result = await directoryTree(dirPath, maxDepth, includeFiles, excludePatterns, format);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to generate directory tree: ${error.message}`), tools.directoryTree);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to generate directory tree ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
