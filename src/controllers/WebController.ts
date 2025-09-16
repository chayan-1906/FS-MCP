import path from "path";
import fs from "fs/promises";
import { Request, Response } from "express";
import { PORT } from "../config/config";
import { embeddedHtmlErrorPage, htmlFileErrorPage } from "../utils/errorPages";
import { tools } from "../utils/constants";
import { getToolsByCategory } from "mcp-utils/utils";
import { generateHomepageHTML } from "../templates/homepageHTML";

const serveHomePageController = async (req: Request, res: Response) => {
    const toolsByCategory = getToolsByCategory(tools);
    const homepageHtml = generateHomepageHTML(toolsByCategory, PORT);
    res.send(homepageHtml);
}

const serveInputController = async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');

    if ((process as any).pkg) {
        try {
            const embeddedModule = require("../utils/embeddedHtml");
            res.send(embeddedModule.getEmbeddedHTML());
        } catch (error: any) {
            res.send(embeddedHtmlErrorPage(error.message, PORT));
        }
    } else {
        try {
            const htmlPath = path.join(__dirname, "..", "public", "fs-permissions-manager.html");
            const htmlContent = await fs.readFile(htmlPath, "utf8");
            res.send(htmlContent);
        } catch (error: any) {
            const htmlPath = path.join(__dirname, "public", "fs-permissions-manager.html");
            res.send(htmlFileErrorPage(error.message, PORT, htmlPath));
        }
    }
}

const serveFavIconController = async (req: Request, res: Response) => {
    try {
        const iconPath = path.join(__dirname, "..", "public", "file-system.png");
        res.setHeader('Content-Type', 'image/png');
        const iconData = await fs.readFile(iconPath);
        res.send(iconData);
    } catch (error: any) {
        res.status(404).send('Favicon not found');
    }
}

export { serveHomePageController, serveInputController, serveFavIconController };
