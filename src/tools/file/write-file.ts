import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import {sendError} from "mcp-utils/utils";
import path from "path";

const writeFile = async (filePath: string, content: string, encoding: string = "utf8") => {
    const fullPath = resolvePath(filePath);

    // Ensure parent directory exists
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, {recursive: true});

    await fs.writeFile(fullPath, content, encoding as BufferEncoding);
    return `File written successfully: ${filePath}`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.writeFile,
        "Write content to a file at the specified path, creating or overwriting the file",
        {
            path: z.string().describe("Absolute or base-relative path to the file to write"),
            content: z.string().describe("Text content to write into the file"),
            encoding: z.enum(["utf8", "ascii", "base64", "hex"]).optional().describe("Encoding to use when writing the file. Defaults to 'utf8'")
        },
        async ({path: filePath, content, encoding}) => {
            try {
                const result = await writeFile(filePath, content, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to write file: ${error.message}`), tools.writeFile);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to write file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
