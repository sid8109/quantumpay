const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

const cleanupScriptPath = path.join(__dirname, 'cleanup.js');

cron.schedule('0 0 * * *', () => {
  console.log('Running cleanup script...');
  exec(`node ${cleanupScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing cleanup script: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return;
    }

    console.log(`Script stdout: ${stdout}`);
  });
});
