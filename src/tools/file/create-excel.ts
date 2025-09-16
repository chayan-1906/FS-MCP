import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import ExcelJS from "exceljs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { ExcelData } from "../../types";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const createExcel = async (filePath: string, data: ExcelData) => {
    const fullPath = await resolvePath(filePath, 'write');
    const finalPath = fullPath.endsWith('.xlsx') ? fullPath : `${fullPath}.xlsx`;

    const parentDir = path.dirname(finalPath);
    await fs.mkdir(parentDir, {recursive: true});

    const workbook = new ExcelJS.Workbook();

    for (const [sheetName, sheetConfig] of Object.entries(data)) {
        const worksheet = workbook.addWorksheet(sheetName);

        // Add data
        sheetConfig.data.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                worksheet.getCell(rowIndex + 1, colIndex + 1).value = value;
            });
        });

        // Apply styles
        if (sheetConfig.styles) {
            for (const [cellAddr, style] of Object.entries(sheetConfig.styles)) {
                const cell = worksheet.getCell(cellAddr);

                // Font styling
                if (style.font) {
                    const fontStyle: any = {};
                    if (style.font.name) fontStyle.name = style.font.name;
                    if (style.font.size) fontStyle.size = style.font.size;
                    if (style.font.bold !== undefined) fontStyle.bold = style.font.bold;
                    if (style.font.italic !== undefined) fontStyle.italic = style.font.italic;
                    if (style.font.underline !== undefined) fontStyle.underline = style.font.underline;
                    if (style.font.strike !== undefined) fontStyle.strike = style.font.strike;
                    if (style.font.color) fontStyle.color = {argb: 'FF' + style.font.color.replace('#', '')};

                    cell.font = fontStyle;
                }

                // Fill/background
                if (style.fill && style.fill.fgColor) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: 'FF' + style.fill.fgColor.replace('#', '')}
                    };
                }

                // Borders
                if (style.border) {
                    const borders: any = {};
                    ['top', 'bottom', 'left', 'right'].forEach(side => {
                        const borderSide = style.border![side as keyof typeof style.border];
                        if (borderSide) {
                            borders[side] = {
                                style: borderSide.style || 'thin',
                                color: {argb: 'FF' + (borderSide.color ? borderSide.color.replace('#', '') : '000000')}
                            };
                        }
                    });
                    if (Object.keys(borders).length > 0) {
                        cell.border = borders;
                    }
                }

                // Alignment
                if (style.alignment) {
                    const alignmentStyle: any = {};
                    if (style.alignment.horizontal) alignmentStyle.horizontal = style.alignment.horizontal;
                    if (style.alignment.vertical) alignmentStyle.vertical = style.alignment.vertical;
                    if (style.alignment.wrapText !== undefined) alignmentStyle.wrapText = style.alignment.wrapText;
                    if (style.alignment.textRotation !== undefined) alignmentStyle.textRotation = style.alignment.textRotation;

                    cell.alignment = alignmentStyle;
                }

                // Number format
                if (style.numberFormat) {
                    cell.numFmt = style.numberFormat;
                }
            }
        }

        // Column widths
        if (sheetConfig.colWidths) {
            sheetConfig.colWidths.forEach((width, index) => {
                worksheet.getColumn(index + 1).width = width;
            });
        }

        // Row heights
        if (sheetConfig.rowHeights) {
            sheetConfig.rowHeights.forEach((height, index) => {
                worksheet.getRow(index + 1).height = height;
            });
        }

        // Merges
        if (sheetConfig.merges) {
            sheetConfig.merges.forEach(merge => {
                worksheet.mergeCells(`${merge.start}:${merge.end}`);
            });
        }
    }

    await workbook.xlsx.writeFile(finalPath);

    return `Excel file created successfully: ${path.basename(finalPath)} ✅`;
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.createExcel;
    server.tool(
        toolConfig.name,
        toolConfig.techDescription,
        {
            filePath: z.string().describe(toolConfig.parameters.find(p => p.name === 'filePath')?.techDescription || ''),
            data: z.record(z.object({
                data: z.array(z.array(z.any())).describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'data')?.techDescription || ''),
                styles: z.record(z.object({
                    font: z.object({
                        name: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'name')?.techDescription || ''),
                        size: z.number().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'size')?.techDescription || ''),
                        bold: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'bold')?.techDescription || ''),
                        italic: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'italic')?.techDescription || ''),
                        underline: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'underline')?.techDescription || ''),
                        strike: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'strike')?.techDescription || ''),
                        color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.parameters?.find(ff => ff.name === 'color')?.techDescription || '')
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'font')?.techDescription || ''),
                    fill: z.object({
                        type: z.enum(["solid", "gradient"]).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'fill')?.parameters?.find(ff => ff.name === 'type')?.techDescription || ''),
                        fgColor: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'fill')?.parameters?.find(ff => ff.name === 'fgColor')?.techDescription || ''),
                        bgColor: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'fill')?.parameters?.find(ff => ff.name === 'bgColor')?.techDescription || '')
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'fill')?.techDescription || ''),
                    border: z.object({
                        top: z.object({
                            style: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'top')?.parameters?.find(tf => tf.name === 'style')?.techDescription || ''),
                            color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'top')?.parameters?.find(tf => tf.name === 'color')?.techDescription || '')
                        }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'top')?.techDescription || ''),
                        bottom: z.object({
                            style: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'bottom')?.parameters?.find(tf => tf.name === 'style')?.techDescription || ''),
                            color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'bottom')?.parameters?.find(tf => tf.name === 'color')?.techDescription || '')
                        }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'bottom')?.techDescription || ''),
                        left: z.object({
                            style: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'left')?.parameters?.find(tf => tf.name === 'style')?.techDescription || ''),
                            color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'left')?.parameters?.find(tf => tf.name === 'color')?.techDescription || '')
                        }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'left')?.techDescription || ''),
                        right: z.object({
                            style: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'right')?.parameters?.find(tf => tf.name === 'style')?.techDescription || ''),
                            color: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'right')?.parameters?.find(tf => tf.name === 'color')?.techDescription || '')
                        }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.parameters?.find(bf => bf.name === 'right')?.techDescription || '')
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'border')?.techDescription || ''),
                    alignment: z.object({
                        horizontal: z.enum(["left", "center", "right", "justify"]).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'alignment')?.parameters?.find(af => af.name === 'horizontal')?.techDescription || ''),
                        vertical: z.enum(["top", "middle", "bottom"]).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'alignment')?.parameters?.find(af => af.name === 'vertical')?.techDescription || ''),
                        wrapText: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'alignment')?.parameters?.find(af => af.name === 'wrapText')?.techDescription || ''),
                        textRotation: z.number().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'alignment')?.parameters?.find(af => af.name === 'textRotation')?.techDescription || '')
                    }).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'alignment')?.techDescription || ''),
                    numberFormat: z.string().optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.parameters?.find(sf => sf.name === 'numberFormat')?.techDescription || ''),
                })).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'styles')?.techDescription || ''),
                colWidths: z.array(z.number()).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'colWidths')?.techDescription || ''),
                rowHeights: z.array(z.number()).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'rowHeights')?.techDescription || ''),
                merges: z.array(z.object({
                    start: z.string().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'merges')?.parameters?.find(mf => mf.name === 'start')?.techDescription || ''),
                    end: z.string().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'merges')?.parameters?.find(mf => mf.name === 'end')?.techDescription || ''),
                })).optional().describe(toolConfig.parameters.find(p => p.name === 'data')?.parameters?.find(f => f.name === 'merges')?.techDescription || ''),
            })).describe(toolConfig.parameters.find(p => p.name === 'data')?.techDescription || ''),
            options: z.object({
                headers: z.boolean().optional().describe(toolConfig.parameters.find(p => p.name === 'options')?.parameters?.find(of => of.name === 'headers')?.techDescription || ''),
                sheetNames: z.array(z.string()).optional().describe(toolConfig.parameters.find(p => p.name === 'options')?.parameters?.find(of => of.name === 'sheetNames')?.techDescription || ''),
            }).optional().describe(toolConfig.parameters.find(p => p.name === 'options')?.techDescription || ''),
        },
        async ({filePath, data, options = {}}) => {
            try {
                const result = await createExcel(filePath, data);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: result,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create Excel file: ${error.message}`), toolConfig.name);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to create Excel file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
