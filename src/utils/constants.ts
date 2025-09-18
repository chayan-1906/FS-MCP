import { ToolsMap } from "mcp-utils/types";

const tools: ToolsMap = {
    // directory
    getDirectoryContent: {
        name: 'get-directory-content',
        category: 'Directories',
        techDescription: 'Returns a list all files and folders within the specified directory',
        userFriendlyDescription: 'Show all files and folders in a specific location on your computer',
        parameters: [
            {
                name: 'dirPath',
                techDescription: 'Absolute or base-relative directory path to list. Defaults to the base/root directory if omitted',
                userFriendlyDescription: 'The folder location you want to see the contents of',
                optional: true,
            },
        ],
    },
    createDirectory: {
        name: 'create-directory',
        category: 'Directories',
        techDescription: 'Creates a new directory at the specified path',
        userFriendlyDescription: 'Make a new folder at a specific location on your computer',
        parameters: [
            {
                name: 'dirPath',
                techDescription: 'Absolute or base-relative path of the directory to create',
                userFriendlyDescription: 'The location where you want to create the new folder',
                optional: false,
            },
            {
                name: 'recursive',
                techDescription: 'Whether to create parent directories if they do not exist. Defaults to true',
                userFriendlyDescription: 'Also create any missing parent folders in the path if needed',
                optional: true,
            },
        ],
    },
    deleteDirectory: {
        name: 'delete-directory',
        category: 'Directories',
        techDescription: 'Deletes a directory',
        userFriendlyDescription: 'Remove a folder from your computer',
        parameters: [
            {
                name: 'dirPath',
                techDescription: 'Absolute or base-relative path of the directory to delete',
                userFriendlyDescription: 'The location of the folder you want to delete',
                optional: false,
            },
            {
                name: 'recursive',
                techDescription: 'If true, deletes the directory and all its contents. Defaults to false',
                userFriendlyDescription: 'Also delete all files and folders inside (if true), or only delete empty folders (if false)',
                optional: true,
            },
        ],
    },
    listAllowedDirectories: {
        name: 'list-allowed-directories',
        category: 'Directories',
        techDescription: 'Returns the list of allowed directories and their permissions from the configuration',
        userFriendlyDescription: 'Show which folders you have permission to access on this system',
        parameters: [],
    },
    directoryTree: {
        name: 'directory-tree',
        category: 'Directories',
        techDescription: 'Generates a hierarchical tree view of directory structure with customizable depth and filtering options',
        userFriendlyDescription: 'Show the folder structure of a directory as a visual tree with files and subfolders',
        parameters: [
            {
                name: 'dirPath',
                techDescription: 'Absolute or base-relative path to the directory. Defaults to current directory',
                userFriendlyDescription: 'The folder location you want to see the structure of',
                optional: true,
            },
            {
                name: 'maxDepth',
                techDescription: 'Maximum depth to traverse (default: 3). Use 1 for current level only',
                userFriendlyDescription: 'How many levels deep to show (1 = only direct contents, 3 = up to 3 levels deep)',
                optional: true,
            },
            {
                name: 'includeFiles',
                techDescription: 'Include files in the tree output (default: true). Set false for directories only',
                userFriendlyDescription: 'Whether to show files or only folders',
                optional: true,
            },
            {
                name: 'excludePatterns',
                techDescription: 'Array of patterns to exclude (default: [\'.git\', \'node_modules\', \'.next\', \'dist\', \'build\']). Supports wildcards with *',
                userFriendlyDescription: 'List of folder/file names to skip (like hidden system folders)',
                optional: true,
            },
            {
                name: 'format',
                techDescription: 'Output format: \'visual\' for tree diagram, \'json\' for structured data, \'both\' for combined output (default: \'visual\')',
                userFriendlyDescription: 'How to display the results: as a visual tree, structured data, or both',
                optional: true,
            },
        ],
    },

    // file
    readFile: {
        name: 'read-file',
        category: 'Files',
        techDescription: 'Reads file content with line numbers. Supports reading specific line ranges.',
        userFriendlyDescription: 'Open and read the contents of a file on your computer',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the file',
                userFriendlyDescription: 'The location of the file you want to read',
                optional: false,
            },
            {
                name: 'startLine',
                techDescription: 'Starting line number (1-based, optional)',
                userFriendlyDescription: 'The line number to start reading from (optional)',
                optional: true,
            },
            {
                name: 'endLine',
                techDescription: 'Ending line number (1-based, optional)',
                userFriendlyDescription: 'The line number to stop reading at (optional)',
                optional: true,
            },
            {
                name: 'encoding',
                techDescription: 'Encoding to use (default: utf8)',
                userFriendlyDescription: 'How to interpret the file characters (usually utf8)',
                optional: true,
            },
        ],
    },
    createFile: {
        name: 'create-file',
        category: 'Files',
        techDescription: 'Creates a new empty file at the specified path',
        userFriendlyDescription: 'Make a new empty file at a specific location',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the file to create',
                userFriendlyDescription: 'Where you want to create the new file',
                optional: false,
            },
        ],
    },
    modifyFile: {
        name: 'modify-file',
        category: 'Files',
        techDescription: 'Modifies specific lines in a file without rewriting it. Always get exact line numbers first with read-file',
        userFriendlyDescription: 'Change, add, or remove specific lines in an existing file',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the file to modify',
                userFriendlyDescription: 'The file you want to change',
                optional: false,
            },
            {
                name: 'operation',
                techDescription: 'Type of modification: insert (add new line), replace (change existing line), delete (remove line)',
                userFriendlyDescription: 'What you want to do: add new content, replace existing content, or delete content',
                optional: false,
            },
            {
                name: 'lineNumber',
                techDescription: 'Line number to modify (1-based)',
                userFriendlyDescription: 'Which line number to change (starting from 1)',
                optional: false,
            },
            {
                name: 'content',
                techDescription: 'Content for insert/replace operations',
                userFriendlyDescription: 'The new text to add or replace with',
                optional: true,
            },
            {
                name: 'lineCount',
                techDescription: 'Number of lines for replace/delete operations (default: 1)',
                userFriendlyDescription: 'How many lines to replace or delete',
                optional: true,
            },
            {
                name: 'encoding',
                techDescription: 'Encoding to use (default: utf8)',
                userFriendlyDescription: 'How to interpret the file characters (usually utf8)',
                optional: true,
            },
        ],
    },
    createExcel: {
        name: 'create-excel',
        category: 'Files',
        techDescription: 'Creates an Excel sheet (.xlsx) with specified data and advanced styling',
        userFriendlyDescription: 'Create a new Excel spreadsheet file with data and formatting',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the Excel file (will add .xlsx if missing)',
                userFriendlyDescription: 'Where to save the new Excel file',
                optional: false,
            },
            {
                name: 'data',
                techDescription: 'Object where keys are sheet names and values are sheet configurations',
                userFriendlyDescription: 'The spreadsheet data organized by sheet names',
                optional: false,
                parameters: [
                    {
                        name: 'data',
                        techDescription: '2D array of cell data',
                        userFriendlyDescription: 'The spreadsheet data as rows and columns',
                        optional: false,
                    },
                    {
                        name: 'styles',
                        techDescription: 'Cell styles by address (e.g., \'A1\', \'B2\')',
                        userFriendlyDescription: 'Formatting for specific cells (colors, fonts, borders)',
                        optional: true,
                        parameters: [
                            {
                                name: 'font',
                                techDescription: 'Font styling options',
                                userFriendlyDescription: 'How the text should look (font family, size, style)',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'name',
                                        techDescription: 'Font family (e.g., \'Arial\', \'Calibri\')',
                                        userFriendlyDescription: 'The font type to use',
                                        optional: true,
                                    },
                                    {
                                        name: 'size',
                                        techDescription: 'Font size in points',
                                        userFriendlyDescription: 'The size of the text',
                                        optional: true,
                                    },
                                    {
                                        name: 'bold',
                                        techDescription: 'Make text bold',
                                        userFriendlyDescription: 'Make the text appear in bold',
                                        optional: true,
                                    },
                                    {
                                        name: 'italic',
                                        techDescription: 'Make text italic',
                                        userFriendlyDescription: 'Make the text appear in italic',
                                        optional: true,
                                    },
                                    {
                                        name: 'underline',
                                        techDescription: 'Apply underline',
                                        userFriendlyDescription: 'Underline the text',
                                        optional: true,
                                    },
                                    {
                                        name: 'strike',
                                        techDescription: 'Apply strikethrough',
                                        userFriendlyDescription: 'Strike through the text',
                                        optional: true,
                                    },
                                    {
                                        name: 'color',
                                        techDescription: 'Hex color code (e.g., \'#FF0000\')',
                                        userFriendlyDescription: 'The color of the text',
                                        optional: true,
                                    }
                                ],
                            },
                            {
                                name: 'fill',
                                techDescription: 'Cell background fill options',
                                userFriendlyDescription: 'How to fill the cell background',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'type',
                                        techDescription: 'Fill type',
                                        userFriendlyDescription: 'Type of fill pattern',
                                        optional: true,
                                    },
                                    {
                                        name: 'fgColor',
                                        techDescription: 'Foreground color (hex)',
                                        userFriendlyDescription: 'Primary fill color',
                                        optional: true,
                                    },
                                    {
                                        name: 'bgColor',
                                        techDescription: 'Background color (hex)',
                                        userFriendlyDescription: 'Secondary fill color',
                                        optional: true,
                                    }
                                ],
                            },
                            {
                                name: 'border',
                                techDescription: 'Cell border options',
                                userFriendlyDescription: 'How to style the cell borders',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'top',
                                        techDescription: 'Top border styling',
                                        userFriendlyDescription: 'Style for the top border',
                                        optional: true,
                                        parameters: [
                                            {
                                                name: 'style',
                                                techDescription: 'Border style (thin, medium, thick, etc.)',
                                                userFriendlyDescription: 'The style of the border line',
                                                optional: true,
                                            },
                                            {
                                                name: 'color',
                                                techDescription: 'Border color (hex)',
                                                userFriendlyDescription: 'The color of the border',
                                                optional: true,
                                            }
                                        ],
                                    },
                                    {
                                        name: 'bottom',
                                        techDescription: 'Bottom border styling',
                                        userFriendlyDescription: 'Style for the bottom border',
                                        optional: true,
                                        parameters: [
                                            {
                                                name: 'style',
                                                techDescription: 'Border style (thin, medium, thick, etc.)',
                                                userFriendlyDescription: 'The style of the border line',
                                                optional: true,
                                            },
                                            {
                                                name: 'color',
                                                techDescription: 'Border color (hex)',
                                                userFriendlyDescription: 'The color of the border',
                                                optional: true,
                                            }
                                        ],
                                    },
                                    {
                                        name: 'left',
                                        techDescription: 'Left border styling',
                                        userFriendlyDescription: 'Style for the left border',
                                        optional: true,
                                        parameters: [
                                            {
                                                name: 'style',
                                                techDescription: 'Border style (thin, medium, thick, etc.)',
                                                userFriendlyDescription: 'The style of the border line',
                                                optional: true,
                                            },
                                            {
                                                name: 'color',
                                                techDescription: 'Border color (hex)',
                                                userFriendlyDescription: 'The color of the border',
                                                optional: true,
                                            },
                                        ],
                                    },
                                    {
                                        name: 'right',
                                        techDescription: 'Right border styling',
                                        userFriendlyDescription: 'Style for the right border',
                                        optional: true,
                                        parameters: [
                                            {
                                                name: 'style',
                                                techDescription: 'Border style (thin, medium, thick, etc.)',
                                                userFriendlyDescription: 'The style of the border line',
                                                optional: true,
                                            },
                                            {
                                                name: 'color',
                                                techDescription: 'Border color (hex)',
                                                userFriendlyDescription: 'The color of the border',
                                                optional: true,
                                            },
                                        ],
                                    }
                                ],
                            },
                            {
                                name: 'alignment',
                                techDescription: 'Cell alignment options',
                                userFriendlyDescription: 'How to align text within the cell',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'horizontal',
                                        techDescription: 'Horizontal text alignment',
                                        userFriendlyDescription: 'How to align text horizontally',
                                        optional: true,
                                    },
                                    {
                                        name: 'vertical',
                                        techDescription: 'Vertical text alignment',
                                        userFriendlyDescription: 'How to align text vertically',
                                        optional: true,
                                    },
                                    {
                                        name: 'wrapText',
                                        techDescription: 'Wrap text in cell',
                                        userFriendlyDescription: 'Whether to wrap text if it exceeds cell width',
                                        optional: true,
                                    },
                                    {
                                        name: 'textRotation',
                                        techDescription: 'Text rotation in degrees',
                                        userFriendlyDescription: 'How many degrees to rotate the text',
                                        optional: true,
                                    },
                                ],
                            },
                            {
                                name: 'numberFormat',
                                techDescription: 'Number format (e.g., \'0.00\', \'#,##0\', \'mm/dd/yyyy\')',
                                userFriendlyDescription: 'How to format numbers and dates',
                                optional: true,
                            },
                        ],
                    },
                    {
                        name: 'colWidths',
                        techDescription: 'Column widths in Excel units',
                        userFriendlyDescription: 'How wide each column should be',
                        optional: true,
                    },
                    {
                        name: 'rowHeights',
                        techDescription: 'Row heights in points',
                        userFriendlyDescription: 'How tall each row should be',
                        optional: true,
                    },
                    {
                        name: 'merges',
                        techDescription: 'Cell ranges to merge',
                        userFriendlyDescription: 'Which cells to combine together',
                        optional: true,
                        parameters: [
                            {
                                name: 'start',
                                techDescription: 'Start cell (e.g., \'A1\')',
                                userFriendlyDescription: 'The top-left cell of the merge range',
                                optional: false,
                            },
                            {
                                name: 'end',
                                techDescription: 'End cell (e.g., \'C3\')',
                                userFriendlyDescription: 'The bottom-right cell of the merge range',
                                optional: false,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'options',
                techDescription: 'Additional options for Excel creation',
                userFriendlyDescription: 'Extra settings for customizing Excel file creation',
                optional: true,
                parameters: [
                    {
                        name: 'headers',
                        techDescription: 'Whether first row contains headers (default: true)',
                        userFriendlyDescription: 'Treat the first row as column headers',
                        optional: true,
                    },
                    {
                        name: 'sheetNames',
                        techDescription: 'Optional custom sheet names',
                        userFriendlyDescription: 'Custom names for the spreadsheet tabs',
                        optional: true,
                    },
                ],
            }
        ],
    },
    readExcel: {
        name: 'read-excel',
        category: 'Files',
        techDescription: 'Reads Excel (.xlsx) files and returns data from all sheets',
        userFriendlyDescription: 'Open and read data from an Excel spreadsheet file',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Path to Excel file',
                userFriendlyDescription: 'The location of the Excel file to read',
                optional: false,
            },
        ],
    },
    createPresentation: {
        name: 'create-presentation',
        category: 'Files',
        techDescription: 'Creates a PowerPoint presentation (.pptx) with specified slides and content',
        userFriendlyDescription: 'Create a new PowerPoint presentation with slides and content',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the presentation file (will add .pptx if missing)',
                userFriendlyDescription: 'Where to save the new PowerPoint file',
                optional: false,
            },
            {
                name: 'data',
                techDescription: 'Presentation data with title and slides',
                userFriendlyDescription: 'The presentation content including title and slide information',
                optional: false,
                parameters: [
                    {
                        name: 'title',
                        techDescription: 'Presentation title',
                        userFriendlyDescription: 'The main title of the presentation',
                        optional: false,
                    },
                    {
                        name: 'author',
                        techDescription: 'Author name',
                        userFriendlyDescription: 'The name of the presentation author',
                        optional: true,
                    },
                    {
                        name: 'slides',
                        techDescription: 'Array of slide data',
                        userFriendlyDescription: 'The individual slides in the presentation',
                        optional: false,
                        parameters: [
                            {
                                name: 'title',
                                techDescription: 'Slide title',
                                userFriendlyDescription: 'The title text for this slide',
                                optional: true,
                            },
                            {
                                name: 'titleStyle',
                                techDescription: 'Title formatting options',
                                userFriendlyDescription: 'How the slide title should look',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'fontSize',
                                        techDescription: 'Font size in points',
                                        userFriendlyDescription: 'The size of the title text',
                                        optional: true,
                                    },
                                    {
                                        name: 'fontFace',
                                        techDescription: 'Font family name',
                                        userFriendlyDescription: 'The font type to use for the title',
                                        optional: true,
                                    },
                                    {
                                        name: 'color',
                                        techDescription: 'Hex color code',
                                        userFriendlyDescription: 'The color of the title text',
                                        optional: true,
                                    },
                                    {
                                        name: 'bold',
                                        techDescription: 'Make text bold',
                                        userFriendlyDescription: 'Make the title text bold',
                                        optional: true,
                                    },
                                    {
                                        name: 'italic',
                                        techDescription: 'Make text italic',
                                        userFriendlyDescription: 'Make the title text italic',
                                        optional: true,
                                    },
                                ],
                            },
                            {
                                name: 'content',
                                techDescription: 'Array of text content/bullet points',
                                userFriendlyDescription: 'The main content text for this slide',
                                optional: true,
                            },
                            {
                                name: 'contentStyle',
                                techDescription: 'Content formatting options',
                                userFriendlyDescription: 'How the slide content should look',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'fontSize',
                                        techDescription: 'Font size in points',
                                        userFriendlyDescription: 'The size of the content text',
                                        optional: true,
                                    },
                                    {
                                        name: 'fontFace',
                                        techDescription: 'Font family name',
                                        userFriendlyDescription: 'The font type to use for the content',
                                        optional: true,
                                    },
                                    {
                                        name: 'color',
                                        techDescription: 'Hex color code',
                                        userFriendlyDescription: 'The color of the content text',
                                        optional: true,
                                    },
                                    {
                                        name: 'bold',
                                        techDescription: 'Make text bold',
                                        userFriendlyDescription: 'Make the content text bold',
                                        optional: true,
                                    },
                                    {
                                        name: 'italic',
                                        techDescription: 'Make text italic',
                                        userFriendlyDescription: 'Make the content text italic',
                                        optional: true,
                                    },
                                ],
                            },
                            {
                                name: 'backgroundColor',
                                techDescription: 'Hex color for slide background',
                                userFriendlyDescription: 'The background color of the slide',
                                optional: true,
                            },
                            {
                                name: 'layout',
                                techDescription: 'Slide layout type',
                                userFriendlyDescription: 'The layout style for this slide',
                                optional: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'options',
                techDescription: 'Additional options for presentation creation',
                userFriendlyDescription: 'Extra settings for customizing presentation creation',
                optional: true,
                parameters: [
                    {
                        name: 'slideSize',
                        techDescription: 'Slide dimensions',
                        userFriendlyDescription: 'The size format for the presentation slides',
                        optional: true,
                    },
                ],
            },
        ],
    },
    readPresentation: {
        name: 'read-presentation',
        category: 'Files',
        techDescription: 'Reads PowerPoint (.pptx) files and extracts text content',
        userFriendlyDescription: 'Open and read text content from a PowerPoint presentation',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Path to PowerPoint file',
                userFriendlyDescription: 'The location of the PowerPoint file to read',
                optional: false,
            },
        ],
    },
    createDocument: {
        name: 'create-document',
        category: 'Files',
        techDescription: 'Creates a Word document (.docx) with specified content and formatting',
        userFriendlyDescription: 'Create a new Word document with text, formatting, and layout',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the document file (will add .docx if missing)',
                userFriendlyDescription: 'Where to save the new Word document',
                optional: false,
            },
            {
                name: 'data',
                techDescription: 'Document data with title and sections',
                userFriendlyDescription: 'The document content including title and text sections',
                optional: false,
                parameters: [
                    {
                        name: 'title',
                        techDescription: 'Document title',
                        userFriendlyDescription: 'The main title of the document',
                        optional: false,
                    },
                    {
                        name: 'author',
                        techDescription: 'Author name',
                        userFriendlyDescription: 'The name of the document author',
                        optional: true,
                    },
                    {
                        name: 'header',
                        techDescription: 'Header text',
                        userFriendlyDescription: 'Text that appears at the top of each page',
                        optional: true,
                    },
                    {
                        name: 'footer',
                        techDescription: 'Footer text',
                        userFriendlyDescription: 'Text that appears at the bottom of each page',
                        optional: true,
                    },
                    {
                        name: 'sections',
                        techDescription: 'Document sections',
                        userFriendlyDescription: 'The main content sections of the document',
                        optional: false,
                        parameters: [
                            {
                                name: 'type',
                                techDescription: 'Content type',
                                userFriendlyDescription: 'What kind of content this section contains',
                                optional: false,
                            },
                            {
                                name: 'text',
                                techDescription: 'Text content',
                                userFriendlyDescription: 'The actual text for this section',
                                optional: true,
                            },
                            {
                                name: 'items',
                                techDescription: 'List items',
                                userFriendlyDescription: 'Items for bulleted or numbered lists',
                                optional: true,
                            },
                            {
                                name: 'rows',
                                techDescription: 'Table rows',
                                userFriendlyDescription: 'Data rows for tables',
                                optional: true,
                            },
                            {
                                name: 'link',
                                techDescription: 'Hyperlink',
                                userFriendlyDescription: 'Web link information',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'text',
                                        techDescription: 'Link text',
                                        userFriendlyDescription: 'The link display text',
                                        optional: false,
                                    },
                                    {
                                        name: 'url',
                                        techDescription: 'URL',
                                        userFriendlyDescription: 'The link URL',
                                        optional: false,
                                    },
                                ],
                            },
                            {
                                name: 'style',
                                techDescription: 'Text formatting options',
                                userFriendlyDescription: 'How the text should look (bold, italic, color, etc.)',
                                optional: true,
                                parameters: [
                                    {
                                        name: 'bold',
                                        techDescription: 'Make text bold',
                                        userFriendlyDescription: 'Make the text appear in bold formatting',
                                        optional: true,
                                    },
                                    {
                                        name: 'italic',
                                        techDescription: 'Make text italic',
                                        userFriendlyDescription: 'Make the text appear in italic formatting',
                                        optional: true,
                                    },
                                    {
                                        name: 'size',
                                        techDescription: 'Font size in points',
                                        userFriendlyDescription: 'The size of the text font',
                                        optional: true,
                                    },
                                    {
                                        name: 'color',
                                        techDescription: 'Hex color code',
                                        userFriendlyDescription: 'The color of the text (e.g., #FF0000 for red)',
                                        optional: true,
                                    },
                                    {
                                        name: 'fontFamily',
                                        techDescription: 'Font family',
                                        userFriendlyDescription: 'The font type to use (e.g., Arial, Times New Roman)',
                                        optional: true,
                                    },
                                    {
                                        name: 'alignment',
                                        techDescription: 'Text alignment',
                                        userFriendlyDescription: 'How to align the text (left, center, right, justify)',
                                        optional: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: 'options',
                techDescription: 'Additional options for document creation',
                userFriendlyDescription: 'Extra settings for customizing document creation',
                optional: true,
            }
        ],
    },
    readDocument: {
        name: 'read-document',
        category: 'Files',
        techDescription: 'Reads Word (.docx) files and extracts text content',
        userFriendlyDescription: 'Open and read text content from a Word document',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Path to Word document',
                userFriendlyDescription: 'The location of the Word document to read',
                optional: false,
            },
        ],
    },
    copyFile: {
        name: 'copy-file',
        category: 'Files',
        techDescription: 'Copies a file from the source path to the destination path',
        userFriendlyDescription: 'Make a copy of a file in a different location',
        parameters: [
            {
                name: 'source',
                techDescription: 'Absolute or base-relative path of the source file',
                userFriendlyDescription: 'The file you want to copy',
                optional: false,
            },
            {
                name: 'destination',
                techDescription: 'Absolute or base-relative path where the file should be copied to',
                userFriendlyDescription: 'Where you want to save the copy',
                optional: false,
            },
        ],
    },
    deleteFile: {
        name: 'delete-file',
        category: 'Files',
        techDescription: 'Deletes a file at the specified path',
        userFriendlyDescription: 'Permanently remove a file from your computer',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the file to delete',
                userFriendlyDescription: 'The file you want to delete',
                optional: false,
            },
        ],
    },

    getFileDirectoryInfo: {
        name: 'get-file-directory-info',
        category: 'System',
        techDescription: 'Retrieves metadata about a file or directory',
        userFriendlyDescription: 'Get detailed information about a file or folder (size, dates, permissions)',
        parameters: [
            {
                name: 'filePath',
                techDescription: 'Absolute or base-relative path to the file or directory',
                userFriendlyDescription: 'The file or folder you want information about',
                optional: false,
            },
        ],
    },
    searchFileDirectory: {
        name: 'search-file-directory',
        category: 'System',
        techDescription: 'Searches for files or directories by name within allowed directories',
        userFriendlyDescription: 'Find files or folders by searching for their names',
        parameters: [
            {
                name: 'searchName',
                techDescription: 'Name or partial name to search for',
                userFriendlyDescription: 'The name or part of the name you\'re looking for',
                optional: false,
            },
            {
                name: 'searchType',
                techDescription: 'Type to search for, defaults to \'both\' when users don\'t clarify whether it\'s a file or directory',
                userFriendlyDescription: 'Whether to search for files, folders, or both',
                optional: true,
            },
            {
                name: 'maxDepth',
                techDescription: 'Maximum search depth (default: 5)',
                userFriendlyDescription: 'How many folder levels deep to search',
                optional: true,
            },
        ],
    },
    moveRenameFileDirectory: {
        name: 'move-rename-file-directory',
        category: 'System',
        techDescription: 'Moves or renames a file or directory from the source path to the destination path',
        userFriendlyDescription: 'Move a file/folder to a new location or give it a new name',
        parameters: [
            {
                name: 'source',
                techDescription: 'Absolute or base-relative path of the file or directory to move or rename',
                userFriendlyDescription: 'The file or folder you want to move or rename',
                optional: false,
            },
            {
                name: 'destination',
                techDescription: 'Absolute or base-relative target path',
                userFriendlyDescription: 'The new location or name for the file/folder',
                optional: false,
            },
        ],
    },
    runShellCommand: {
        name: 'run-shell-command',
        category: 'System',
        techDescription: 'Executes a shell command on the server. Use carefully, this does not touch the GitHub API, but runs commands in the local environment',
        userFriendlyDescription: 'Run a command line instruction on the computer',
        parameters: [
            {
                name: 'command',
                techDescription: 'The exact shell command to run',
                userFriendlyDescription: 'The command you want to execute',
                optional: false,
            },
            {
                name: 'cwd',
                techDescription: 'Working directory path',
                userFriendlyDescription: 'The folder where the command should run',
                optional: false,
            },
        ],
    },
};

const constants = {
    fsConfigFile: "file_system_config.json",
};

export { tools, constants };
