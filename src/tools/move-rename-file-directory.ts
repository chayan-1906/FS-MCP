import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../server";
import { tools } from "../utils/constants";
import resolvePath from "../utils/resolvePath";

const moveRenameFileDirectory = async (source: string, destination: string) => {
    const fullSource = await resolvePath(source, 'write');
    const fullDestination = await resolvePath(destination, 'write');

    // Ensure destination directory exists
    const parentDir = path.dirname(fullDestination);
    await fs.mkdir(parentDir, {recursive: true});

    await fs.rename(fullSource, fullDestination);
    return `Moved ${source} to ${destination} ✅`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.moveRenameFileDirectory,
        "Moves or renames a file or directory from the source path to the destination path",
        {
            source: z.string().describe("Absolute or base-relative path of the file or directory to move or rename"),
            destination: z.string().describe("Absolute or base-relative target path"),
        },
        async ({source, destination}) => {
            try {
                const result = await moveRenameFileDirectory(source, destination);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to move file: ${error.message}`), tools.moveRenameFileDirectory);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to move file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
