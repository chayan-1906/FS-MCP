import { Tool } from "mcp-utils/dist/types/tool";

const generateHomepageHTML = (toolsByCategory: Record<string, Tool[]>, port: number): string => {
    const categories = Object.keys(toolsByCategory);
    const totalTools = Object.values(toolsByCategory).reduce((sum, tools) => sum + tools.length, 0);

    const generateToolCard = (tool: Tool) => {
        const paramCount = tool.parameters?.length || 0;
        return `
            <div class="tool-card">
                <div class="tool-header">
                    <h3 class="tool-name">${tool.name}</h3>
                    <span class="param-badge">${paramCount} param${paramCount !== 1 ? 's' : ''}</span>
                </div>
                <p class="tool-description">${tool.userFriendlyDescription}</p>
                <div class="tool-footer">
                    <span class="tool-category-tag">${tool.category || 'General'}</span>
                </div>
            </div>
        `;
    }

    const generateCategorySection = (category: string, tools: Tool[]) => {
        const categoryIcon = {
            'Directories': '📁',
            'Files': '📄',
            'System': '⚙️'
        }[category] || '🔧';

        return `
            <section class="category-section">
                <div class="category-header">
                    <span class="category-icon">${categoryIcon}</span>
                    <h2 class="category-title">${category}</h2>
                    <span class="category-count">${tools.length} tool${tools.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="tools-grid">
                    ${tools.map(generateToolCard).join('')}
                </div>
            </section>
        `;
    }

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File System MCP Server - Available Tools</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .header {
                    text-align: center;
                    margin-bottom: 3rem;
                    color: white;
                }

                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .header p {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin-bottom: 1rem;
                }

                .server-info {
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                }

                .category-section {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }

                .category-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                }

                .category-icon {
                    font-size: 2rem;
                    margin-right: 1rem;
                }

                .category-title {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #2d3748;
                    flex-grow: 1;
                }

                .category-count {
                    background: #667eea;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .tools-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .tool-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .tool-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    border-color: #667eea;
                }

                .tool-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .tool-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2d3748;
                    font-family: 'Monaco', 'Consolas', monospace;
                }

                .param-badge {
                    background: #e2e8f0;
                    color: #4a5568;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .tool-description {
                    color: #4a5568;
                    font-size: 0.95rem;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }

                .tool-footer {
                    display: flex;
                    justify-content: flex-end;
                }

                .tool-category-tag {
                    background: #667eea;
                    color: white;
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .footer {
                    text-align: center;
                    margin-top: 3rem;
                    color: white;
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 1rem;
                    }

                    .header h1 {
                        font-size: 2rem;
                    }

                    .tools-grid {
                        grid-template-columns: 1fr;
                    }

                    .category-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <h1>🗂️ File System MCP Server</h1>
                    <p>Comprehensive file and directory management tools for your applications • ${totalTools} tools available</p>
                </header>

                <main>
                    ${categories.map(category => generateCategorySection(category, toolsByCategory[category])).join('')}
                </main>

                <footer class="footer">
                    <p>💡 Each tool provides safe, controlled access to file system operations</p>
                </footer>
            </div>
        </body>
        </html>
    `;
}

export { generateHomepageHTML };
