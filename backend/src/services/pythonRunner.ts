import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export function runPythonScript(scriptName: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    // Search across python subdirectories
    const candidatePaths = [
      path.join(process.cwd(), 'python', 'analytics', scriptName),
      path.join(process.cwd(), 'python', 'predictive_maintenance', scriptName),
      path.join(process.cwd(), 'python', 'agents', scriptName),
      path.join(process.cwd(), 'python', scriptName)
    ];

    let scriptPath = candidatePaths[0];
    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        scriptPath = candidate;
        break;
      }
    }

    const pythonProcess = spawn('python3', [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script ${scriptName} exited with code ${code}:`, errorOutput);
        return reject(new Error(errorOutput || `Python script exited with code ${code}`));
      }
      try {
        const parsed = JSON.parse(output.trim());
        resolve(parsed);
      } catch (err) {
        resolve({ rawOutput: output.trim(), engine: 'Analytical Forecasting Model' });
      }
    });
  });
}
