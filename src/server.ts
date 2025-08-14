const startTime = Date.now();

import cors from "cors";
import express from "express";
import * as fs from "fs/promises";
import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { addOrUpdateMCPServer, freezePortOnQuit, killPortOnLaunch, printInConsole, setEntry } from "mcp-utils/utils";
import { PORT } from "./config/config";
import { setupMcpTools } from "./controllers";
import { modifyFile } from "./tools/file/modify-file";
import { SystemControllerRoute } from "./controllers/SystemController";

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use(cors());

// Create an MCP server
const server = new McpServer({
    name: "FileSystem",
    version: "1.0.0",
});

// REST API Routes
app.post("/api/modify-file", async (req, res) => {
    try {
        const {filePath, content, encoding} = req.body;

        // For API usage, we need to replace entire file content
        // First, check if file exists and count lines
        let totalLines = 1;
        try {
            const fs = await import("fs/promises");
            const resolvePath = (await import("./utils/resolvePath")).default;
            const fullPath = await resolvePath(filePath, 'read');
            const existingContent = await fs.readFile(fullPath, (encoding || "utf8") as BufferEncoding);
            totalLines = existingContent.split('\n').length;
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        const result = await modifyFile(filePath, "replace", 1, content, totalLines, encoding);
        res.json({success: true, message: result});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
});

app.post("/api/read-file", async (req, res) => {
    try {
        const {filePath} = req.body;
        const content = await fs.readFile(filePath, "utf8");
        res.json({success: true, content});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
});

app.get("/api/config-file-path", async (req, res) => {
    try {
        const {getClaudeConfigDir} = await import("mcp-utils/utils");
        const {constants} = await import("./utils/constants");
        const filePath = path.join(getClaudeConfigDir(), constants.fsConfigFile);
        res.json({success: true, filePath});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
});

app.post("/api/initialize-config", async (req, res) => {
    try {
        const {getAllowedRoots} = await import("./utils/getAllowedRoots");
        const permissions = await getAllowedRoots();
        res.json({success: true, permissions});
    } catch (error: any) {
        res.status(500).json({success: false, error: error.message});
    }
});

// Add the system routes
app.use("/api", SystemControllerRoute);

// Serve static files from src/public directory
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Serve the permissions manager HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "fs-permissions-manager.html"));
});

app.get("/permissions", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "fs-permissions-manager.html"));
});

// Debug route to check if server is working

freezePortOnQuit();

const serverName = "fs";

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

killPortOnLaunch(PORT).then(async () => {
    app.listen(PORT, async () => {
        await printInConsole(transport, `Server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);

        try {
            const {getAllowedRoots} = await import("./utils/getAllowedRoots");
            await getAllowedRoots();
        } catch (error: any) {
            await printInConsole(transport, `Failed to initialize file_system_config.json: ${error.message}`);
        }

        const {entry} = setEntry("") as any;
        await addOrUpdateMCPServer(serverName, entry);
        await startMcp();
        await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    });
});
