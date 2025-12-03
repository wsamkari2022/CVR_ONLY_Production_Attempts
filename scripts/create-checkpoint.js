import { writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { join } from 'path';

// Create checkpoints directory if it doesn't exist
const checkpointsDir = join(process.cwd(), 'checkpoints');
if (!existsSync(checkpointsDir)) {
  mkdirSync(checkpointsDir);
}

// Get current timestamp for checkpoint name
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const checkpointDir = join(checkpointsDir, `checkpoint-${timestamp}`);
mkdirSync(checkpointDir);

// Function to copy directory recursively
function copyDirectory(src, dest) {
  if (!existsSync(src)) return;
  
  if (!existsSync(dest)) {
    mkdirSync(dest);
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    // Skip node_modules and checkpoints directories
    if (entry.name === 'node_modules' || entry.name === 'checkpoints') continue;

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy project files to checkpoint directory
copyDirectory(process.cwd(), checkpointDir);

// Create checkpoint info file
const checkpointInfo = {
  created: new Date().toISOString(),
  description: 'Project checkpoint with alternative decisions feature',
};

writeFileSync(
  join(checkpointDir, 'checkpoint-info.json'),
  JSON.stringify(checkpointInfo, null, 2)
);

console.log(`Checkpoint created at: ${checkpointDir}`);