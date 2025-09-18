import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const deleteFile = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'write');
    await fs.unlink(fullPath);
    return `File deleted: ${filePath} ✅`;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.deleteFile;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
        },
        async ({filePath}) => {
            try {
                const result = await deleteFile(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to delete file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
