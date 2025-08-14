import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const deleteDirectory = async (dirPath: string, recursive: boolean = false) => {
    const fullPath = await resolvePath(dirPath, 'write');

    if (recursive) {
        await fs.rm(fullPath, {recursive: true, force: true});
    } else {
        await fs.rmdir(fullPath);
    }

    return `Directory deleted: ${dirPath}`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.deleteDirectory,
        "Deletes a directory",
        {
            dirPath: z.string().describe("Absolute or base-relative path of the directory to delete"),
            recursive: z.boolean().optional().describe("If true, deletes the directory and all its contents. Defaults to false"),
        },
        async ({dirPath, recursive}) => {
            try {
                const result = await deleteDirectory(dirPath, recursive);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete directory: ${error.message}`), tools.deleteDirectory);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to delete directory ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
