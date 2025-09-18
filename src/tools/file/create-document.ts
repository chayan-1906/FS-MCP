import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import * as docx from "docx";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { DocumentData } from "../../types";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

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
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.createDocument;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
            data: z.object({
                title: z.string().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'title')?.techDescription || ''),
                author: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'author')?.techDescription || ''),
                header: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'header')?.techDescription || ''),
                footer: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'footer')?.techDescription || ''),
                sections: z.array(z.object({
                    type: z.enum(["heading", "paragraph", "list", "table"]).describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'type')?.techDescription || ''),
                    text: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'text')?.techDescription || ''),
                    items: z.array(z.string()).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'items')?.techDescription || ''),
                    rows: z.array(z.array(z.string())).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'rows')?.techDescription || ''),
                    link: z.object({
                        text: z.string().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'link')?.parameters?.find(lf => lf.name === 'text')?.techDescription || ''),
                        url: z.string().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'link')?.parameters?.find(lf => lf.name === 'url')?.techDescription || '')
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'link')?.techDescription || ''),
                    style: z.object({
                        bold: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'bold')?.techDescription || ''),
                        italic: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'italic')?.techDescription || ''),
                        size: z.number().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'size')?.techDescription || ''),
                        color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'color')?.techDescription || ''),
                        fontFamily: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'fontFamily')?.techDescription || ''),
                        alignment: z.enum(["left", "center", "right", "justify"]).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.parameters?.find(stf => stf.name === 'alignment')?.techDescription || ''),
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.parameters?.find(sf => sf.name === 'style')?.techDescription || ''),
                })).describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'sections')?.techDescription || ''),
            }).describe(toolConfig.parameters.find(p => p.name === 'data')?.techDescription || ''),
            options: z.object({}).optional().describe(toolConfig.parameters.find(p => p.name === 'options')?.techDescription || ''),
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
                sendError(transport, new Error(`Failed to create document: ${error.message}`), toolConfig.name);
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
}
