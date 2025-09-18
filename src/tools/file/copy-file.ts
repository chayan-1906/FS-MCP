import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const copyFile = async (source: string, destination: string) => {
    const fullSource = await resolvePath(source, 'read');
    const fullDestination = await resolvePath(destination, 'write');

    // Ensure destination directory exists
    const parentDir = path.dirname(fullDestination);
    await fs.mkdir(parentDir, {recursive: true});

    await fs.copyFile(fullSource, fullDestination);
    return `Copied ${source} to ${destination} ✅`;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.copyFile;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            source: z.string().describe(toolConfig.parameters.find(p => p.name === 'source')?.techDescription || ''),
            destination: z.string().describe(toolConfig.parameters.find(p => p.name === 'destination')?.techDescription || ''),
        },
        async ({source, destination}) => {
            try {
                const result = await copyFile(source, destination);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to copy file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to copy file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
