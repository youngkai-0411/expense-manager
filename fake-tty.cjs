Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });

const { PassThrough } = require('stream');
const mockStdin = new PassThrough();
Object.defineProperty(process, 'stdin', { value: mockStdin, configurable: true });

// Pass args
process.argv = ['node', 'drizzle-kit', 'generate'];

setTimeout(() => {
  // It will ask: "You are about to drop 'type' column..."
  // Provide input to answer the prompt. Usually hitting Enter or Space selects default.
  // We'll send an Enter keystroke.
  mockStdin.write('\r\n');
}, 1000);

// Load drizzle-kit
require('./node_modules/drizzle-kit/bin.cjs');
