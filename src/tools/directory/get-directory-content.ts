import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const listDirectories = async (dirPath: string = ".") => {
    const fullPath = await resolvePath(dirPath, 'read');
    const items = await fs.readdir(fullPath, {withFileTypes: true});

    const result = await Promise.all(
        items.map(async (item) => {
            const itemPath = path.join(fullPath, item.name);
            const stats = await fs.stat(itemPath);

            return {
                name: item.name,
                type: item.isDirectory() ? "directory" : "file",
                size: stats.size,
                modified: stats.mtime.toISOString(),
                permissions: stats.mode.toString(8),
            };
        }),
    );

    return result;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.getDirectoryContent,
        "Returns a list all files and folders within the specified directory",
        {
            dirPath: z.string().optional().describe("Absolute or base-relative directory path to list. Defaults to the base/root directory if omitted"),
        },
        async ({dirPath}) => {
            try {
                const result = await listDirectories(dirPath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get directory content: ${error.message}`), tools.getDirectoryContent);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to get directory content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
