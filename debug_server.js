const path = require('path');
process.chdir(path.join(__dirname, 'server')); // Change CWD to server/

try {
    console.log("Attempting to require server.js...");
    require(path.join(__dirname, 'server', 'server.js'));
} catch (e) {
    console.error("CRITICAL CRASH CAUGHT:");
    console.error(e);
}
