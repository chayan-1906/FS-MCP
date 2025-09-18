import z from "zod";
import path from "path";
import * as yauzl from "yauzl";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const readPresentation = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'read');

    return new Promise((resolve, reject) => {
        yauzl.open(fullPath, {lazyEntries: true}, (err, zipfile) => {
            if (err) return reject(err);

            const slides: any[] = [];
            let presentationData: any = {};

            zipfile!.readEntry();

            zipfile!.on("entry", (entry) => {
                if (entry.fileName.includes("ppt/slides/slide")) {
                    zipfile!.openReadStream(entry, (err, readStream) => {
                        if (err) return reject(err);

                        let xmlData = "";
                        readStream!.on("data", (chunk) => {
                            xmlData += chunk.toString();
                        });

                        readStream!.on("end", () => {
                            const slideText = extractTextFromSlideXML(xmlData);
                            const slideNumber = parseInt(entry.fileName.match(/slide(\d+)\.xml/)?.[1] || "0");
                            slides[slideNumber - 1] = {
                                slideNumber,
                                text: slideText
                            };
                            zipfile!.readEntry();
                        });
                    });
                } else if (entry.fileName === "docProps/core.xml") {
                    zipfile!.openReadStream(entry, (err, readStream) => {
                        if (err) return reject(err);

                        let xmlData = "";
                        readStream!.on("data", (chunk) => {
                            xmlData += chunk.toString();
                        });

                        readStream!.on("end", () => {
                            presentationData = extractCoreProperties(xmlData);
                            zipfile!.readEntry();
                        });
                    });
                } else {
                    zipfile!.readEntry();
                }
            });

            zipfile!.on("end", () => {
                resolve({
                    fileName: path.basename(fullPath),
                    metadata: presentationData,
                    slides: slides.filter(Boolean),
                    slideCount: slides.filter(Boolean).length
                });
            });
        });
    });
}

function extractTextFromSlideXML(xml: string): string[] {
    const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    return textMatches.map(match => {
        const text = match.replace(/<[^>]*>/g, "");
        return text.trim();
    }).filter(text => text.length > 0);
}

function extractCoreProperties(xml: string): any {
    const titleMatch = xml.match(/<dc:title>([^<]*)<\/dc:title>/);
    const authorMatch = xml.match(/<dc:creator>([^<]*)<\/dc:creator>/);
    const createdMatch = xml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/);

    return {
        title: titleMatch?.[1] || "",
        author: authorMatch?.[1] || "",
        created: createdMatch?.[1] || ""
    };
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.readPresentation;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
        },
        async ({filePath}) => {
            try {
                const result = await readPresentation(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to read PowerPoint file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to read PowerPoint file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
