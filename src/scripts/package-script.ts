import { platform } from 'os';
import { execSync } from 'child_process';

const isMacOS = platform() === 'darwin';

const targets = isMacOS
    // ? 'node16-macos-arm64,node16-win-x64'
    ? 'node16-macos-arm64'
    : 'node16-win-x64';

const cmd = `ts-node src/scripts/embed-html.ts && npm run build && npm run bundle && pkg build/index.js --target ${targets} --output dist/file-system`;

execSync(cmd, {stdio: 'inherit'});
