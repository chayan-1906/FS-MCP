import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "path";
import z from "zod";
import * as fs from "fs/promises";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import { sendError } from "../../utils/sendError";

// List Directory Tool
const listDirectoryFunc = async (dirPath: string = ".") => {
    const fullPath = resolvePath(dirPath);
    const items = await fs.readdir(fullPath, { withFileTypes: true });

    const result = await Promise.all(
        items.map(async (item) => {
            const itemPath = path.join(fullPath, item.name);
            const stats = await fs.stat(itemPath);

            return {
                name: item.name,
                type: item.isDirectory() ? "directory" : "file",
                size: stats.size,
                modified: stats.mtime.toISOString(),
                permissions: stats.mode.toString(8),
            };
        })
    );

    return result;
};

// Create Directory Tool
const createDirectoryFunc = async (dirPath: string, recursive: boolean = true) => {
    const fullPath = resolvePath(dirPath);
    await fs.mkdir(fullPath, { recursive });
    return `Directory created: ${dirPath}`;
};

// Delete Directory Tool
const deleteDirectoryFunc = async (dirPath: string, recursive: boolean = false) => {
    const fullPath = resolvePath(dirPath);

    if (recursive) {
        await fs.rm(fullPath, { recursive: true, force: true });
    } else {
        await fs.rmdir(fullPath);
    }

    return `Directory deleted: ${dirPath}`;
};

export const registerListDirectory = (server: McpServer) => {
    server.tool(
        tools.listDirectory,
        "List files and directories in a given path",
        {
            path: z
                .string()
                .optional()
                .describe(
                    "Directory path to list (relative to base path). Defaults to current directory"
                ),
        },
        async ({ path: dirPath }) => {
            try {
                const result = await listDirectoryFunc(dirPath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(
                    transport,
                    new Error(`Failed to list directory: ${error.message}`),
                    tools.listDirectory
                );
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to list directory ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
};

export const registerCreateDirectory = (server: McpServer) => {
    server.tool(
        tools.createDirectory,
        "Create a new directory",
        {
            path: z.string().describe("Directory path to create (relative to base path)"),
            recursive: z
                .boolean()
                .optional()
                .describe("Create parent directories if they don't exist (default: true)"),
        },
        async ({ path: dirPath, recursive }) => {
            try {
                const result = await createDirectoryFunc(dirPath, recursive);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(
                    transport,
                    new Error(`Failed to create directory: ${error.message}`),
                    tools.createDirectory
                );
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
};

export const registerDeleteDirectory = (server: McpServer) => {
    server.tool(
        tools.deleteDirectory,
        "Delete a directory",
        {
            path: z.string().describe("Directory path to delete (relative to base path)"),
            recursive: z
                .boolean()
                .optional()
                .describe("Delete directory and all its contents (default: false)"),
        },
        async ({ path: dirPath, recursive }) => {
            try {
                const result = await deleteDirectoryFunc(dirPath, recursive);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(
                    transport,
                    new Error(`Failed to delete directory: ${error.message}`),
                    tools.deleteDirectory
                );
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
};
