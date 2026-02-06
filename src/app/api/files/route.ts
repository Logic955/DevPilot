import { NextRequest, NextResponse } from 'next/server';
import { scanDirectory, isPathSafe } from '@/lib/files';
import type { FileTreeResponse, ErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dir = searchParams.get('dir');
  const depth = parseInt(searchParams.get('depth') || '3', 10);

  if (!dir) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Missing dir parameter' },
      { status: 400 }
    );
  }

  // Safety: resolve absolute path and validate
  const path = require('path');
  const resolvedDir = path.resolve(dir);

  // Only allow scanning within the provided directory
  if (!isPathSafe(resolvedDir, resolvedDir)) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Invalid directory path' },
      { status: 403 }
    );
  }

  try {
    const tree = scanDirectory(resolvedDir, Math.min(depth, 5));
    return NextResponse.json<FileTreeResponse>({ tree, root: resolvedDir });
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : 'Failed to scan directory' },
      { status: 500 }
    );
  }
}
