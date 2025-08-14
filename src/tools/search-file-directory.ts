import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../server";
import { tools } from "../utils/constants";
import { getAllowedRoots } from "../utils/getAllowedRoots";

const searchFileOrDirectory = async (searchName: string, searchType: 'file' | 'directory' | 'both' = 'both', maxDepth: number = 3) => {
    const results: Array<{ name: string, path: string, type: string }> = [];

    const searchInDirectory = async (dirPath: string, currentDepth: number = 0): Promise<void> => {
        if (currentDepth > maxDepth) return;    // recursion base criteria

        try {
            const items = await fs.readdir(dirPath, {withFileTypes: true});

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);
                const isDirectory = item.isDirectory();

                // Check if this item matches our search
                if (item.name.toLowerCase().includes(searchName.toLowerCase())) {
                    if (searchType === 'both' || (searchType === 'file' && !isDirectory) || (searchType === 'directory' && isDirectory)) {
                        results.push({
                            name: item.name,
                            path: itemPath,
                            type: isDirectory ? 'directory' : 'file',
                        });
                    }
                }

                // Recursively search directories
                if (isDirectory && currentDepth < maxDepth) {
                    await searchInDirectory(itemPath, currentDepth + 1);    // recursion
                }
            }
        } catch (error) {
            // Skip directories we can't access
        }
    }

    const allowedRoots = await getAllowedRoots();

    // Search in all allowed paths
    for (const allowedPath of allowedRoots) {
        await searchInDirectory(allowedPath.path);
    }

    return results;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.searchFileDirectory,
        "Searches for files or directories by name within allowed directories",
        {
            searchName: z.string().describe("Name or partial name to search for"),
            searchType: z.enum(["file", "directory", "both"]).optional().describe("Type to search for, defaults to 'both' when users don't clarify whether it's a file or directory"),
            maxDepth: z.number().optional().describe("Maximum search depth (default: 5)"),
        },
        async ({searchName, searchType = "both", maxDepth = 5}) => {
            try {
                const results = await searchFileOrDirectory(searchName, searchType, maxDepth);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: results.length > 0
                                ? JSON.stringify(results, null, 2)
                                : `No ${searchType === 'both' ? 'files or directories' : searchType} found matching "${searchName}"`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Search failed: ${error.message}`), tools.searchFileDirectory);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Search failed ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
