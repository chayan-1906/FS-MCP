import z from "zod";
import * as fs from "fs/promises";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const createDirectory = async (dirPath: string, recursive: boolean = true) => {
    const fullPath = resolvePath(dirPath);
    await fs.mkdir(fullPath, {recursive});
    return `Directory created: ${dirPath}`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.createDirectory,
        "Creates a new directory at the specified path",
        {
            dirPath: z.string().describe("Absolute or base-relative path of the directory to create"),
            recursive: z.boolean().optional().describe("Whether to create parent directories if they do not exist. Defaults to true")
        },
        async ({dirPath, recursive}) => {
            try {
                const result = await createDirectory(dirPath, recursive);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create directory: ${error.message}`), tools.createDirectory);
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
