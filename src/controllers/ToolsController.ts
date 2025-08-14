import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { transport } from "../server";
import { printInConsole } from "mcp-utils/utils";

import { registerTool as listDirectory } from '../tools/directory/list-directory';
import { registerTool as createDirectory } from '../tools/directory/create-directory';
import { registerTool as deleteDirectory } from '../tools/directory/delete-directory';
import { registerTool as getAllowedDirectories } from '../tools/directory/get-allowed-directories';

import { registerTool as readFile } from '../tools/file/read-file';
import { registerTool as writeFile } from '../tools/file/write-file';
import { registerTool as copyFile } from '../tools/file/copy-file';
import { registerTool as deleteFile } from '../tools/file/delete-file';
import { registerTool as createExcel } from '../tools/file/create-excel';
import { registerTool as readExcel } from '../tools/file/read-excel';
import { registerTool as createPresentation } from '../tools/file/create-presentation';
import { registerTool as readPresentation } from '../tools/file/read-presentation';
import { registerTool as createDocument } from '../tools/file/create-document';
import { registerTool as readDocument } from '../tools/file/read-document';

import { registerTool as getFileDirectoryInfo } from '../tools/get-file-directory-info';
import { registerTool as searchFileDirectory } from '../tools/search-file-directory';
import { registerTool as moveRenameFileDirectory } from '../tools/move-rename-file-directory';
import { registerTool as runShellCommand } from '../tools/run-shell-command';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    // directory
    listDirectory(server);
    createDirectory(server);
    deleteDirectory(server);
    getAllowedDirectories(server);

    // file
    readFile(server);
    writeFile(server);
    createExcel(server);
    readExcel(server);
    createPresentation(server);
    readPresentation(server);
    createDocument(server);
    readDocument(server);
    copyFile(server);
    deleteFile(server);

    getFileDirectoryInfo(server);
    searchFileDirectory(server);
    moveRenameFileDirectory(server);
    runShellCommand(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export { setupMcpTools };