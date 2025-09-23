import init from "./umbraco/init.js";
import test from "./umbraco/test.js";
import remove from "./umbraco/remove.js";
import syncUsync from "./umbraco/usync.js";
import publish from "./umbraco/publish.js";
// Define function for "init-umbraco
function initUmbraco(args) {
  init(args);
}

// Define function for "test-umbraco"
function testUmbraco(args) {
    test(args)
}

// Define function for "remove-umbraco"
function removeUmbraco(args) {
  remove(args);
}

function usync(args) {
  syncUsync(args)
}

function publishPackage(args) {
  publish(args);
}

// Get the action and additional parameters from command-line arguments
const [,, action, ...args] = process.argv; // Capture action and all additional arguments

// Decide which function to execute based on the action
switch (action) {
  case 'init-umbraco':
    initUmbraco(args);
    break;
  case 'test-umbraco':
    testUmbraco(args);
    break;
  case 'remove-umbraco':
    removeUmbraco(args);
    break;
  case 'usync':
    usync(args);
    break;
  case 'publish':
    publishPackage(args);
    break;
  default:
    console.log('Unknown action. Please specify one of the following: init-umbraco, test-umbraco, remove-umbraco');
}
