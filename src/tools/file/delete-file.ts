import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import {sendError} from "mcp-utils/utils";

const deleteFile = async (filePath: string) => {
    const fullPath = resolvePath(filePath);
    await fs.unlink(fullPath);
    return `File deleted: ${filePath}`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.deleteFile,
        "Deletes a file at the specified path",
        {
            path: z.string().describe("Absolute or base-relative path to the file to delete"),
        },
        async ({path: filePath}) => {
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
                sendError(transport, new Error(`Failed to delete file: ${error.message}`), tools.deleteFile);
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
