import z from "zod";
import * as fs from "fs/promises";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

const readFile = async (filePath: string, encoding: string = "utf8") => {
    const fullPath = resolvePath(filePath);
    const content = await fs.readFile(fullPath, encoding as BufferEncoding);
    return content;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.readFile,
        "Reads the contents of a file at the specified path",
        {
            filePath: z.string().describe("Absolute or base-relative path to the file to read"),
            encoding: z.enum(["utf8", "ascii", "base64", "hex"]).optional().describe("Encoding to use when reading the file. Defaults to 'utf8'"),
        },
        async ({filePath, encoding}) => {
            try {
                const content = await readFile(filePath, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: content,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to read file: ${error.message}`), tools.readFile);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to read file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
