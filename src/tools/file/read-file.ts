import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const getFileLines = async (filePath: string, startLine?: number, endLine?: number, encoding: string = "utf8") => {
    const fullPath = await resolvePath(filePath, 'read');
    const fileContent = await fs.readFile(fullPath, encoding as BufferEncoding);
    const lines = fileContent.split('\n');

    if (lines[lines.length - 1] === '' && fileContent.endsWith('\n')) {
        lines.pop();
    }

    const start = startLine ? Math.max(1, Math.min(startLine, lines.length)) - 1 : 0;
    const end = endLine ? Math.max(start + 1, Math.min(endLine, lines.length)) : lines.length;

    let result = `Total lines: ${lines.length}\n\n`;

    for (let i = start; i < end; i++) {
        result += `${i + 1}: ${lines[i]}\n`;
    }

    return result;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.readFile,
        "Reads file content with line numbers. Supports reading specific line ranges.",
        {
            filePath: z.string().describe("Absolute or base-relative path to the file"),
            startLine: z.number().optional().describe("Starting line number (1-based, optional)"),
            endLine: z.number().optional().describe("Ending line number (1-based, optional)"),
            encoding: z.enum(["utf8", "ascii", "base64", "hex"]).optional().describe("Encoding to use (default: utf8)")
        },
        async ({filePath, startLine, endLine, encoding}) => {
            try {
                const result = await getFileLines(filePath, startLine, endLine, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
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
