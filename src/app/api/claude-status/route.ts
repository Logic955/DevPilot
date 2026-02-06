import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const { stdout } = await execFileAsync('claude', ['--version'], {
      timeout: 5000,
      env: { ...process.env, PATH: process.env.PATH },
    });
    const version = stdout.trim();
    return NextResponse.json({ connected: true, version });
  } catch {
    return NextResponse.json({ connected: false, version: null });
  }
}
