import { Tool } from "mcp-utils/dist/types/tool";

const generateHomepageHTML = (toolsByCategory: Record<string, Tool[]>, port: number): string => {
    const categories = Object.keys(toolsByCategory);
    const totalTools = Object.values(toolsByCategory).reduce((sum, tools) => sum + tools.length, 0);

    const generateToolCard = (tool: Tool) => {
        const paramCount = tool.parameters?.length || 0;
        const toolId = tool.name.replace(/[^a-zA-Z0-9]/g, '-');

        return `
            <div class="tool-card" onclick="openToolModal('${toolId}')">
                <div class="tool-header">
                    <h3 class="tool-name">${tool.name}</h3>
                    <span class="param-badge">${paramCount} param${paramCount !== 1 ? 's' : ''}</span>
                </div>
                <p class="tool-description">${tool.userFriendlyDescription}</p>
                <div class="tool-footer">
                    <span class="tool-category-tag">${tool.category || 'General'}</span>
                    <span class="view-details">View Details →</span>
                </div>
            </div>
        `;
    }

    const generateToolModal = (tool: Tool) => {
        const toolId = tool.name.replace(/[^a-zA-Z0-9]/g, '-');
        const params = tool.parameters || [];

        const exampleUsage = {
            'get-directory-content': 'List files in your Documents folder',
            'create-directory': 'Create a new project folder structure',
            'read-file': 'Open and read a configuration file',
            'create-file': 'Create a new document or script file',
            'modify-file': 'Update specific lines in an existing file',
            'create-excel': 'Generate a report or data spreadsheet',
            'search-file-directory': 'Find files by name across your system',
            'run-shell-command': 'Execute system commands safely'
        }[tool.name] || 'Perform file system operations safely';

        return `
            <div id="modal-${toolId}" class="modal" onclick="closeToolModal('${toolId}')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>${tool.name}</h2>
                        <span class="close" onclick="closeToolModal('${toolId}')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="modal-section">
                            <h3>📝 Description</h3>
                            <p>${tool.userFriendlyDescription}</p>
                        </div>

                        <div class="modal-section">
                            <h3>💡 Example Use Case</h3>
                            <p class="example-text">${exampleUsage}</p>
                        </div>

                        ${params.length > 0 ? `
                        <div class="modal-section">
                            <h3>⚙️ Parameters (${params.length})</h3>
                            <div class="parameters-list">
                                ${params.map(param => `
                                    <div class="parameter-item">
                                        <div class="param-header">
                                            <strong>${param.name}</strong>
                                            ${param.optional ? '<span class="optional-badge">Optional</span>' : '<span class="required-badge">Required</span>'}
                                        </div>
                                        <p class="param-description">${param.userFriendlyDescription}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : '<div class="modal-section"><p class="no-params">This tool requires no parameters.</p></div>'}
                    </div>
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
            <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗂️</text></svg>">
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

                .permissions-link {
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .permissions-link:hover {
                    color: #f0f8ff;
                    text-shadow: 0 0 8px rgba(255,255,255,0.5);
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
                    justify-content: space-between;
                    align-items: center;
                }

                .view-details {
                    color: #667eea;
                    font-size: 0.8rem;
                    font-weight: 500;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .tool-card:hover .view-details {
                    opacity: 1;
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

                .search-container {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                }

                .search-box {
                    width: 100%;
                    max-width: 500px;
                }

                .search-box input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 25px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    font-size: 1rem;
                    backdrop-filter: blur(10px);
                    outline: none;
                    transition: background 0.3s ease;
                }

                .search-box input::placeholder {
                    color: rgba(255,255,255,0.7);
                }

                .search-box input:focus {
                    background: rgba(255,255,255,0.3);
                }

                .filter-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .filter-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .filter-btn:hover, .filter-btn.active {
                    background: rgba(255,255,255,0.4);
                    transform: translateY(-1px);
                }

                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background-color: white;
                    margin: 5% auto;
                    padding: 0;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px 12px 0 0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-family: 'Monaco', 'Consolas', monospace;
                }

                .close {
                    color: white;
                    font-size: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    line-height: 1;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .close:hover {
                    opacity: 1;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-section {
                    margin-bottom: 1.5rem;
                }

                .modal-section h3 {
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                }

                .example-text {
                    background: #f7fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                    font-style: italic;
                    color: #4a5568;
                }

                .parameters-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .parameter-item {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1rem;
                }

                .param-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .param-header strong {
                    color: #2d3748;
                    font-family: 'Monaco', 'Consolas', monospace;
                }

                .required-badge {
                    background: #e53e3e;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .optional-badge {
                    background: #38a169;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .param-description {
                    color: #4a5568;
                    margin: 0;
                    line-height: 1.4;
                }

                .no-params {
                    text-align: center;
                    color: #718096;
                    font-style: italic;
                    padding: 2rem;
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

                    <div class="server-info">
                        <a href="/manage-permissions" class="permissions-link">⚙️ Manage File Permissions</a>
                    </div>

                    <div class="search-container">
                        <div class="search-box">
                            <input type="text" id="searchInput" placeholder="🔍 Search tools..." onkeyup="filterTools()">
                        </div>
                        <div class="filter-buttons">
                            <button class="filter-btn active" onclick="filterByCategory()">All</button>
                            ${categories.map(cat => `<button class="filter-btn" onclick="filterByCategory('${cat}')">${cat}</button>`).join('')}
                        </div>
                    </div>
                </header>

                <main>
                    ${categories.map(category => generateCategorySection(category, toolsByCategory[category])).join('')}
                </main>

                ${Object.values(toolsByCategory).flat().map(generateToolModal).join('')}

                <footer class="footer">
                    <p>💡 Each tool provides safe, controlled access to file system operations</p>
                </footer>
            </div>

            <script>
                function openToolModal(toolId) {
                    document.getElementById('modal-' + toolId).style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }

                function closeToolModal(toolId) {
                    document.getElementById('modal-' + toolId).style.display = 'none';
                    document.body.style.overflow = 'auto';
                }

                function filterTools() {
                    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                    const toolCards = document.querySelectorAll('.tool-card');
                    const categorySection = document.querySelectorAll('.category-section');
                    const activeFilter = document.querySelector('.filter-btn.active').textContent;

                    toolCards.forEach(card => {
                        const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
                        const toolDescription = card.querySelector('.tool-description').textContent.toLowerCase();
                        const cardCategory = card.closest('.category-section').querySelector('.category-title').textContent;

                        const searchMatches = toolName.includes(searchTerm) || toolDescription.includes(searchTerm);
                        const categoryMatches = activeFilter === 'All' || cardCategory === activeFilter;

                        card.style.display = (searchMatches && categoryMatches) ? 'block' : 'none';
                    });

                    // Hide empty categories
                    categorySection.forEach(section => {
                        const visibleCards = section.querySelectorAll('.tool-card[style*="block"], .tool-card:not([style*="none"])');
                        section.style.display = visibleCards.length > 0 ? 'block' : 'none';
                    });
                }

                function filterByCategory() {
                    const filterButtons = document.querySelectorAll('.filter-btn');

                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    event.target.classList.add('active');

                    filterTools();
                }

                window.onclick = function(event) {
                    if (event.target.classList.contains('modal')) {
                        event.target.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                }

                document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape') {
                        const openModal = document.querySelector('.modal[style*="block"]');
                        if (openModal) {
                            openModal.style.display = 'none';
                            document.body.style.overflow = 'auto';
                        }
                    }
                });
            </script>
        </body>
        </html>
    `;
}

export { generateHomepageHTML };
