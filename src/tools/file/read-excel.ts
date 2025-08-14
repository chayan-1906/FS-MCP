import z from "zod";
import ExcelJS from "exceljs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendError } from "mcp-utils/utils";
import { transport } from "../../server";
import { tools } from "../../utils/constants";
import resolvePath from "../../utils/resolvePath";

export const readExcel = async (filePath: string) => {
    const fullPath = await resolvePath(filePath, 'read');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fullPath);

    const result: any = {};

    workbook.eachSheet((worksheet, sheetId) => {
        const sheetName = worksheet.name;
        const data: any[][] = [];

        worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
            const rowData: any[] = [];
            row.eachCell({includeEmpty: true}, (cell, colNumber) => {
                rowData[colNumber - 1] = cell.value;
            });
            data[rowNumber - 1] = rowData;
        });

        result[sheetName] = {
            data: data,
            rowCount: worksheet.rowCount,
            columnCount: worksheet.columnCount
        };
    });

    return result;
};

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.readExcel,
        "Reads Excel (.xlsx) files and returns data from all sheets",
        {
            filePath: z.string().describe("Path to Excel file"),
        },
        async ({filePath}) => {
            try {
                const result = await readExcel(filePath);

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to read Excel file: ${error.message}`), tools.readExcel);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Failed to read Excel file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
};
