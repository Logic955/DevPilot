import { NextRequest } from 'next/server';
import { getMessages, getSession } from '@/lib/db';
import type { MessagesResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(id);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const messages = getMessages(id);
    const response: MessagesResponse = { messages };
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return Response.json({ error: message }, { status: 500 });
  }
}
