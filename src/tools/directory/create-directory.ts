import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const createDirectory = async (dirPath: string, recursive: boolean = true) => {
    const fullPath = await resolvePath(dirPath, 'write');
    await fs.mkdir(fullPath, {recursive});
    return fullPath;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.createDirectory;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            dirPath: z.string().describe(toolConfig.parameters.find(p => p.name === 'dirPath')?.techDescription || ''),
            recursive: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'recursive')?.techDescription || ''),
        },
        async ({dirPath, recursive}) => {
            try {
                const fullPath = await createDirectory(dirPath, recursive);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Directory created successfully ✅: ${fullPath}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create directory: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to create directory ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
