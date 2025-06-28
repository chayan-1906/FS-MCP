import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";
import { sendError } from "../../utils/sendError";

// Read File Tool
const readFileFunc = async (filePath: string, encoding: string = "utf8") => {
    const fullPath = resolvePath(filePath);
    const content = await fs.readFile(fullPath, encoding as BufferEncoding);
    return content;
};

// Write File Tool
const writeFileFunc = async (filePath: string, content: string, encoding: string = "utf8") => {
    const fullPath = resolvePath(filePath);

    // Ensure parent directory exists
    const parentDir = path.dirname(fullPath);
    await fs.mkdir(parentDir, { recursive: true });

    await fs.writeFile(fullPath, content, encoding as BufferEncoding);
    return `File written successfully: ${filePath}`;
};

// Delete File Tool
const deleteFileFunc = async (filePath: string) => {
    const fullPath = resolvePath(filePath);
    await fs.unlink(fullPath);
    return `File deleted: ${filePath}`;
};

// Move File Tool
const moveFileFunc = async (sourcePath: string, destinationPath: string) => {
    const fullSource = resolvePath(sourcePath);
    const fullDestination = resolvePath(destinationPath);

    // Ensure destination directory exists
    const parentDir = path.dirname(fullDestination);
    await fs.mkdir(parentDir, { recursive: true });

    await fs.rename(fullSource, fullDestination);
    return `Moved ${sourcePath} to ${destinationPath}`;
};

// Copy File Tool
const copyFileFunc = async (sourcePath: string, destinationPath: string) => {
    const fullSource = resolvePath(sourcePath);
    const fullDestination = resolvePath(destinationPath);

    // Ensure destination directory exists
    const parentDir = path.dirname(fullDestination);
    await fs.mkdir(parentDir, { recursive: true });

    await fs.copyFile(fullSource, fullDestination);
    return `Copied ${sourcePath} to ${destinationPath}`;
};

// Get File Info Tool
const getFileInfoFunc = async (filePath: string) => {
    const fullPath = resolvePath(filePath);
    const stats = await fs.stat(fullPath);

    const info = {
        path: filePath,
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        isReadable: !!(stats.mode & parseInt("444", 8)),
        isWritable: !!(stats.mode & parseInt("222", 8)),
        isExecutable: !!(stats.mode & parseInt("111", 8)),
    };

    return info;
};

export const registerReadFile = (server: McpServer) => {
    server.tool(
        tools.readFile,
        "Read contents of a file",
        {
            path: z.string().describe("File path to read (relative to base path)"),
            encoding: z
                .enum(["utf8", "ascii", "base64", "hex"])
                .optional()
                .describe("File encoding (default: utf8)"),
        },
        async ({ path: filePath, encoding }) => {
            try {
                const content = await readFileFunc(filePath, encoding);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: content,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(
                    transport,
                    new Error(`Failed to read file: ${error.message}`),
                    tools.readFile
                );
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
};

export const registerWriteFile = (server: McpServer) => {
    server.tool(
        tools.writeFile,
        "Write content to a file",
        {
            path: z.string().describe("File path to write (relative to base path)"),
            content: z.string().describe("Content to write to the file"),
            encoding: z
                .enum(["utf8", "ascii", "base64", "hex"])
                .optional()
                .describe("File encoding (default: utf8)"),
        },
        async ({ path: filePath, content, encoding }) => {
            try {
                const result = await writeFileFunc(filePath, content, encoding);

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
                    new Error(`Failed to write file: ${error.message}`),
                    tools.writeFile
                );
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
};

export const registerDeleteFile = (server: McpServer) => {
    server.tool(
        tools.deleteFile,
        "Delete a file",
        {
            path: z.string().describe("File path to delete (relative to base path)"),
        },
        async ({ path: filePath }) => {
            try {
                const result = await deleteFileFunc(filePath);

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
                    new Error(`Failed to delete file: ${error.message}`),
                    tools.deleteFile
                );
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
};

export const registerMoveFile = (server: McpServer) => {
    server.tool(
        tools.moveFile,
        "Move or rename a file or directory",
        {
            source: z.string().describe("Source path (relative to base path)"),
            destination: z.string().describe("Destination path (relative to base path)"),
        },
        async ({ source, destination }) => {
            try {
                const result = await moveFileFunc(source, destination);

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
                    new Error(`Failed to move file: ${error.message}`),
                    tools.moveFile
                );
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
};

export const registerCopyFile = (server: McpServer) => {
    server.tool(
        tools.copyFile,
        "Copy a file",
        {
            source: z.string().describe("Source file path (relative to base path)"),
            destination: z.string().describe("Destination file path (relative to base path)"),
        },
        async ({ source, destination }) => {
            try {
                const result = await copyFileFunc(source, destination);

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
                    new Error(`Failed to copy file: ${error.message}`),
                    tools.copyFile
                );
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
};

export const registerGetFileInfo = (server: McpServer) => {
    server.tool(
        tools.getFileInfo,
        "Get information about a file or directory",
        {
            path: z.string().describe("File or directory path (relative to base path)"),
        },
        async ({ path: filePath }) => {
            try {
                const result = await getFileInfoFunc(filePath);

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
                    new Error(`Failed to get file info: ${error.message}`),
                    tools.getFileInfo
                );
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to get file info ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
};
