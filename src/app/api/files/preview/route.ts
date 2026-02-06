import { NextRequest, NextResponse } from 'next/server';
import { readFilePreview, isPathSafe } from '@/lib/files';
import type { FilePreviewResponse, ErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filePath = searchParams.get('path');
  const maxLines = parseInt(searchParams.get('maxLines') || '200', 10);

  if (!filePath) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  const path = require('path');
  const resolvedPath = path.resolve(filePath);

  // Basic safety: the file must exist under some reasonable base
  // We check it resolves to an absolute path and is not a traversal attempt
  const dir = path.dirname(resolvedPath);
  if (!isPathSafe(dir, resolvedPath)) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Invalid file path' },
      { status: 403 }
    );
  }

  try {
    const preview = readFilePreview(resolvedPath, Math.min(maxLines, 1000));
    return NextResponse.json<FilePreviewResponse>({ preview });
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 500 }
    );
  }
}
