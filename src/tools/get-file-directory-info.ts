import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../server";
import { tools } from "../utils/constants";
import resolvePath from "../utils/resolvePath";

const getFileDirectoryInfo = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'read');
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
    const toolConfig = tools.getFileDirectoryInfo;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || '')
        },
        async ({filePath}) => {
            try {
                const result = await getFileDirectoryInfo(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get file/directory info: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to get file/directory info ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
