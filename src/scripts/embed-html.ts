import * as fs from 'fs';
import * as path from 'path';

function embedHtml() {
    const htmlPath = path.join(__dirname, '../public/fs-permissions-manager.html');
    const outputPath = path.join(__dirname, '../utils/embeddedHtml.ts');

    try {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Escape backticks and ${} in the HTML content
        const escapedHtml = htmlContent
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$\{/g, '\\${');

        const tsContent = `// This file is auto-generated during build. Do not edit manually.
                            export function getEmbeddedHTML(): string {
                                return \`${escapedHtml}\`;
                            }
                          `;

        fs.writeFileSync(outputPath, tsContent);
        console.log('✅ HTML embedded successfully for production build');
    } catch (error) {
        console.error('❌ Failed to embed HTML:', error);
        process.exit(1);
    }
}

embedHtml();
