import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import * as docx from "docx";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

interface DocumentSection {
    type: "heading" | "paragraph" | "list" | "table";
    text?: string;
    items?: string[];
    rows?: string[][];
    link?: { text: string; url: string };
    style?: {
        bold?: boolean;
        italic?: boolean;
        size?: number;
        color?: string;
        fontFamily?: string;
        alignment?: "left" | "center" | "right" | "justify";
    };
}

interface DocumentData {
    title: string;
    author?: string;
    header?: string;
    footer?: string;
    sections: DocumentSection[];
}

export const createDocument = async (filePath: string, data: DocumentData, options: {} = {}) => {
    const fullPath = await resolvePath(filePath, 'write');
    const finalPath = fullPath.endsWith('.docx') ? fullPath : `${fullPath}.docx`;
    const parentDir = path.dirname(finalPath);
    await fs.mkdir(parentDir, {recursive: true});

    const children: any[] = [
        new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: data.title,
                    bold: true,
                    size: 32,
                }),
            ],
            heading: docx.HeadingLevel.TITLE,
            alignment: docx.AlignmentType.CENTER,
        })
    ];

    if (data.author) {
        children.push(new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: `By: ${data.author}`,
                    italics: true,
                    size: 24,
                }),
            ],
            alignment: docx.AlignmentType.CENTER,
        }));
    }

    children.push(new docx.Paragraph({children: []}));

    for (const section of data.sections) {
        const style = section.style || {};

        if (section.type === "paragraph" || section.type === "heading") {
            if (section.link) {
                children.push(new docx.Paragraph({
                    children: [
                        new docx.ExternalHyperlink({
                            children: [
                                new docx.TextRun({
                                    text: section.link.text,
                                    underline: {type: 'single'},
                                    color: "0000FF"
                                })
                            ],
                            link: section.link.url,
                        })
                    ],
                }));
            } else {
                children.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: section.text || "",
                            bold: style.bold || false,
                            italics: style.italic || false,
                            size: style.size || 22,
                            color: style.color?.replace('#', '') || undefined,
                            font: style.fontFamily || undefined,
                        }),
                    ],
                    heading: section.type === "heading" ? docx.HeadingLevel.HEADING_1 : undefined,
                    alignment: style.alignment === "center" ? docx.AlignmentType.CENTER :
                        style.alignment === "right" ? docx.AlignmentType.RIGHT :
                            style.alignment === "justify" ? docx.AlignmentType.JUSTIFIED :
                                docx.AlignmentType.LEFT,
                }));
            }
        } else if (section.type === "list" && section.items) {
            section.items.forEach(item => {
                children.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: `• ${item}`,
                            bold: style.bold || false,
                            italics: style.italic || false,
                            size: style.size || 22,
                            color: style.color?.replace('#', '') || undefined,
                            font: style.fontFamily || undefined,
                        })
                    ],
                }));
            });
        } else if (section.type === "table" && section.rows) {
            const tableRows = section.rows.map(row =>
                new docx.TableRow({
                    children: row.map(cell =>
                        new docx.TableCell({
                            children: [
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({
                                            text: cell,
                                            size: style.size || 22,
                                            font: style.fontFamily || undefined,
                                        })
                                    ]
                                })
                            ]
                        })
                    )
                })
            );

            children.push(new docx.Table({
                rows: tableRows,
            }));
        }
    }

    const sections: any[] = [{
        children: children,
    }];

    if (data.header) {
        sections[0].headers = {
            default: new docx.Header({
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: data.header,
                            })
                        ],
                        alignment: docx.AlignmentType.CENTER,
                    })
                ]
            })
        };
    }

    if (data.footer) {
        sections[0].footers = {
            default: new docx.Footer({
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: data.footer,
                            })
                        ],
                        alignment: docx.AlignmentType.CENTER,
                    })
                ]
            })
        };
    }

    const doc = new docx.Document({
        sections: sections,
    });

    const buffer = await docx.Packer.toBuffer(doc);
    await fs.writeFile(finalPath, buffer);

    return `Document created successfully: ${path.basename(finalPath)} (${data.sections.length} sections) ✅`;
};

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.createDocument,
        "Creates a Word document (.docx) with specified content and formatting",
        {
            filePath: z.string().describe("Absolute or base-relative path to the document file (will add .docx if missing)"),
            data: z.object({
                title: z.string().describe("Document title"),
                author: z.string().optional().describe("Author name"),
                header: z.string().optional().describe("Header text"),
                footer: z.string().optional().describe("Footer text"),
                sections: z.array(z.object({
                    type: z.enum(["heading", "paragraph", "list", "table"]).describe("Content type"),
                    text: z.string().optional().describe("Text content"),
                    items: z.array(z.string()).optional().describe("List items"),
                    rows: z.array(z.array(z.string())).optional().describe("Table rows"),
                    link: z.object({
                        text: z.string().describe("Link text"),
                        url: z.string().describe("URL")
                    }).optional().describe("Hyperlink"),
                    style: z.object({
                        bold: z.boolean().optional(),
                        italic: z.boolean().optional(),
                        size: z.number().optional().describe("Font size in points"),
                        color: z.string().optional().describe("Hex color code"),
                        fontFamily: z.string().optional().describe("Font family"),
                        alignment: z.enum(["left", "center", "right", "justify"]).optional(),
                    }).optional(),
                })).describe("Document sections"),
            }).describe("Document data with title and sections"),
            options: z.object({}).optional()
        },
        async ({filePath, data, options = {}}) => {
            try {
                const result = await createDocument(filePath, data, options);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create document: ${error.message}`), tools.createDocument);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to create document ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
};
