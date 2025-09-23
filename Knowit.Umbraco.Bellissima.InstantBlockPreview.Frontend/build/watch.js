// watch.js

import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { spawn } from 'child_process';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the folder path and app plugins directory from command-line arguments
const args = process.argv.slice(2); // Skip the first two default arguments
const baseFolderPath = path.join(__dirname, args[0]);
const appPluginsPath = args[1] || 'App_Plugins'; // Default to 'App_Plugins' if not provided

// Function to list all folders in a directory
async function listFolders(directoryPath) {
  try {
    const files = await readdir(directoryPath, { withFileTypes: true });

    // Filter out directories from the list of files
    const folders = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return folders;
  } catch (err) {
    console.error('Unable to scan directory:', err);
    return [];
  }
}

// Function to prompt user to select a folder or auto-select if only one
async function selectFolder(folders) {
  if (folders.length === 1) {
    console.log(`Only one folder found: ${folders[0]}. Auto-selecting it.`);
    return folders[0];
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFolder',
      message: 'Please select a folder:',
      choices: folders,
    },
  ]);

  console.log(`You selected: ${answer.selectedFolder}`);
  return answer.selectedFolder;
}

// Function to run Vite in watch mode
function runViteWatch(selectedFolder) {
  // Construct the outDir path using the selected folder and app plugins directory
  const outDir = path.join(baseFolderPath, selectedFolder, appPluginsPath);

  // Set the environment variable for OUT_DIR
  const env = { ...process.env, OUT_DIR: outDir };

  // Use spawn instead of exec to get real-time output
  const viteProcess = spawn('vite', ['build', '--watch'], { env, shell: true });

  viteProcess.stdout.on('data', (data) => {
    console.log(`Vite: ${data}`);
  });

  viteProcess.stderr.on('data', (data) => {
    console.error(`Vite Error: ${data}`);
  });

  viteProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Vite process exited with code ${code}`);
    } else {
      console.log('Vite watch process exited successfully');
    }
  });
}

// Main function to execute the script
async function main() {
  const folders = await listFolders(baseFolderPath);
  if (folders.length > 0) {
    const selectedFolder = await selectFolder(folders);
    runViteWatch(selectedFolder);
  } else {
    console.log('No folders found.');
  }
}

main();
