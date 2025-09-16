import resolvePath from "../utils/resolvePath";
import path from "path";
import fs from "fs/promises";
import ExcelJS from "exceljs";

export interface TreeNode {
    name: string;
    type: "file" | "directory";
    path: string;
    size?: number;
    extension?: string;
    children?: TreeNode[];
}

export interface TreeResult {
    path: string;
    totalFiles: number;
    totalDirectories: number;
    tree: TreeNode[];
}

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

export interface ExcelData {
    [sheetName: string]: {
        data: any[][];
        styles?: { [cellAddress: string]: CellStyle };
        colWidths?: number[];
        rowHeights?: number[];
        merges?: Array<{ start: string; end: string }>;
    };
}

interface SlideContent {
    title?: string;
    titleStyle?: {
        fontSize?: number;
        fontFace?: string;
        color?: string;
        bold?: boolean;
        italic?: boolean;
    };
    content?: string[];
    contentStyle?: {
        fontSize?: number;
        fontFace?: string;
        color?: string;
        bold?: boolean;
        italic?: boolean;
    };
    backgroundColor?: string;
    layout?: "title" | "content" | "section" | "comparison" | "blank";
}

export interface PresentationData {
    title: string;
    author?: string;
    slides: SlideContent[];
}

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

export interface DocumentData {
    title: string;
    author?: string;
    header?: string;
    footer?: string;
    sections: DocumentSection[];
}
