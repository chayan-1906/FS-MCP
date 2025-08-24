import z from "zod";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const modifyFile = async (filePath: string, operation: "insert" | "replace" | "delete", lineNumber: number, content?: string, lineCount: number = 1, encoding: string = "utf8") => {
    const fullPath = await resolvePath(filePath, 'write');

    const fileContent = await fs.readFile(fullPath, encoding as BufferEncoding);
    const lines = fileContent.split('\n');

    const targetLine = lineNumber - 1;

    if (targetLine < 0 || targetLine > lines.length) {
        throw new Error(`Line number ${lineNumber} is out of range (1-${lines.length})`);
    }

    switch (operation) {
        case "insert":
            if (!content) throw new Error("Content required for insert operation");
            lines.splice(targetLine, 0, content);
            break;

        case "replace":
            if (!content) throw new Error("Content required for replace operation");
            lines.splice(targetLine, lineCount, content);
            break;

        case "delete":
            lines.splice(targetLine, lineCount);
            break;
    }

    const modifiedContent = lines.join('\n');
    await fs.writeFile(fullPath, modifiedContent, encoding as BufferEncoding);

    return `File modified successfully: ${filePath} ✅`;
}

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.modifyFile,
        `Modifies specific lines in a file without rewriting it. Always get exact line numbers first with ${tools.readFile}`,
        {
            filePath: z.string().describe("Absolute or base-relative path to the file to modify"),
            operation: z.enum(["insert", "replace", "delete"]).describe("Type of modification: insert (add new line), replace (change existing line), delete (remove line)"),
            lineNumber: z.number().describe("Line number to modify (1-based)"),
            content: z.string().optional().describe("Content for insert/replace operations"),
            lineCount: z.number().optional().describe("Number of lines for replace/delete operations (default: 1)"),
            encoding: z.enum(["utf8", "ascii", "base64", "hex"]).optional().describe("Encoding to use (default: utf8)")
        },
        async ({filePath, operation, lineNumber, content, lineCount, encoding}) => {
            try {
                const result = await modifyFile(filePath, operation, lineNumber, content, lineCount, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to modify file: ${error.message}`), tools.modifyFile);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to modify file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
