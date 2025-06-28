import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import {sendError} from "mcp-utils/utils";

const deleteDirectory = async (dirPath: string, recursive: boolean = false) => {
    const fullPath = resolvePath(dirPath);

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
            path: z.string().describe("Absolute or base-relative path of the directory to delete"),
            recursive: z.boolean().optional().describe("If true, deletes the directory and all its contents. Defaults to false"),
        },
        async ({path: dirPath, recursive}) => {
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
