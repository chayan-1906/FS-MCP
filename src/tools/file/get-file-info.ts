import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import {sendError} from "mcp-utils/utils";

const getFileInfo = async (filePath: string) => {
    const fullPath = resolvePath(filePath);
    const stats = await fs.stat(fullPath);

    const fileInfo = {
        path: filePath,
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        isReadable: !!(stats.mode & parseInt("444", 8)),
        isWritable: !!(stats.mode & parseInt("222", 8)),
        isExecutable: !!(stats.mode & parseInt("111", 8)),
    };

    return fileInfo;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.getFileInfo,
        "Retrieves metadata about a file",
        {
            path: z.string().describe("Absolute or base-relative path to the file or directory")
        },
        async ({path: filePath}) => {
            try {
                const result = await getFileInfo(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get file info: ${error.message}`), tools.getFileInfo);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to get file info ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
