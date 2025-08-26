const startTime = Date.now();

import cors from "cors";
import path from "path";
import express from "express";
import * as fs from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { addOrUpdateMCPServer, freezePortOnQuit, killPortOnLaunch, printInConsole, setEntry } from "mcp-utils/utils";
import { PORT } from "./config/config";
import WebRoutes from "./routes/WebRoutes";
import SystemRoutes from "./routes/SystemRoutes";
import { setupMcpTools } from "./controllers/ToolsController";

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use(cors());

const server = new McpServer({
    name: "FileSystem",
    version: "1.0.0",
});

app.use("/", WebRoutes);
app.use("/api", SystemRoutes);

freezePortOnQuit();

const serverName = "file-system";

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
