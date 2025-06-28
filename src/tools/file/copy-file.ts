import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import {sendError} from "mcp-utils/utils";
import path from "path";

const copyFile = async (sourcePath: string, destinationPath: string) => {
    const fullSource = resolvePath(sourcePath);
    const fullDestination = resolvePath(destinationPath);

    // Ensure destination directory exists
    const parentDir = path.dirname(fullDestination);
    await fs.mkdir(parentDir, {recursive: true});

    await fs.copyFile(fullSource, fullDestination);
    return `Copied ${sourcePath} to ${destinationPath}`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.copyFile,
        "Copies a file from the source path to the destination path",
        {
            source: z.string().describe("Absolute or base-relative path of the source file"),
            destination: z.string().describe("Absolute or base-relative path where the file should be copied to"),
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
                sendError(transport, new Error(`Failed to copy file: ${error.message}`), tools.copyFile);
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
