import z from "zod";
import path from "path";
import * as fs from "fs/promises";
import ExcelJS from "exceljs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

interface CellStyle {
    font?: {
        name?: string;
        size?: number;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strike?: boolean;
        color?: string;
    };
    fill?: {
        type?: "solid" | "gradient";
        fgColor?: string;
        bgColor?: string;
    };
    border?: {
        top?: { style?: string; color?: string };
        bottom?: { style?: string; color?: string };
        left?: { style?: string; color?: string };
        right?: { style?: string; color?: string };
    };
    alignment?: {
        horizontal?: "left" | "center" | "right" | "justify";
        vertical?: "top" | "middle" | "bottom";
        wrapText?: boolean;
        textRotation?: number;
    };
    numberFormat?: string;
}

interface ExcelData {
    [sheetName: string]: {
        data: any[][];
        styles?: { [cellAddress: string]: CellStyle };
        colWidths?: number[];
        rowHeights?: number[];
        merges?: Array<{ start: string; end: string }>;
    };
}

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
};

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.createExcel,
        "Creates an Excel sheet (.xlsx) with specified data and advanced styling",
        {
            filePath: z.string().describe("Absolute or base-relative path to the Excel file (will add .xlsx if missing)"),
            data: z.record(z.object({
                data: z.array(z.array(z.any())).describe("2D array of cell data"),
                styles: z.record(z.object({
                    font: z.object({
                        name: z.string().optional().describe("Font family (e.g., 'Arial', 'Calibri')"),
                        size: z.number().optional().describe("Font size in points"),
                        bold: z.boolean().optional(),
                        italic: z.boolean().optional(),
                        underline: z.boolean().optional(),
                        strike: z.boolean().optional(),
                        color: z.string().optional().describe("Hex color code (e.g., '#FF0000')")
                    }).optional(),
                    fill: z.object({
                        type: z.enum(["solid", "gradient"]).optional(),
                        fgColor: z.string().optional().describe("Foreground color (hex)"),
                        bgColor: z.string().optional().describe("Background color (hex)")
                    }).optional(),
                    border: z.object({
                        top: z.object({
                            style: z.string().optional().describe("Border style (thin, medium, thick, etc.)"),
                            color: z.string().optional().describe("Border color (hex)")
                        }).optional(),
                        bottom: z.object({
                            style: z.string().optional(),
                            color: z.string().optional()
                        }).optional(),
                        left: z.object({
                            style: z.string().optional(),
                            color: z.string().optional()
                        }).optional(),
                        right: z.object({
                            style: z.string().optional(),
                            color: z.string().optional()
                        }).optional()
                    }).optional(),
                    alignment: z.object({
                        horizontal: z.enum(["left", "center", "right", "justify"]).optional(),
                        vertical: z.enum(["top", "middle", "bottom"]).optional(),
                        wrapText: z.boolean().optional(),
                        textRotation: z.number().optional().describe("Text rotation in degrees")
                    }).optional(),
                    numberFormat: z.string().optional().describe("Number format (e.g., '0.00', '#,##0', 'mm/dd/yyyy')")
                })).optional().describe("Cell styles by address (e.g., 'A1', 'B2')"),
                colWidths: z.array(z.number()).optional().describe("Column widths in Excel units"),
                rowHeights: z.array(z.number()).optional().describe("Row heights in points"),
                merges: z.array(z.object({
                    start: z.string().describe("Start cell (e.g., 'A1')"),
                    end: z.string().describe("End cell (e.g., 'C3')")
                })).optional().describe("Cell ranges to merge")
            })).describe("Object where keys are sheet names and values are sheet configurations"),
            options: z.object({
                headers: z.boolean().optional().describe("Whether first row contains headers (default: true)"),
                sheetNames: z.array(z.string()).optional().describe("Optional custom sheet names")
            }).optional()
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
                sendError(transport, new Error(`Failed to create Excel file: ${error.message}`), tools.createExcel);
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
};
