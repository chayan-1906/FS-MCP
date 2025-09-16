import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const createFile = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'write');

    try {
        await fs.access(fullPath);
        throw new Error(`File already exists: ${filePath}`);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, {recursive: true});

    await fs.writeFile(fullPath, '', 'utf8');
    return `File created successfully: ${filePath} ✅`;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.createFile;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || '')
        },
        async ({filePath}) => {
            try {
                const result = await createFile(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to create file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
