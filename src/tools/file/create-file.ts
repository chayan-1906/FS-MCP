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
    server.tool(
        tools.createFile,
        "Creates a new empty file at the specified path",
        {
            filePath: z.string().describe("Absolute or base-relative path to the file to create")
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
                sendError(transport, new Error(`Failed to create file: ${error.message}`), tools.createFile);
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
