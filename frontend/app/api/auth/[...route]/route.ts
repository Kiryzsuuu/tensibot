import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function proxyRequest(req: NextRequest, path: string): Promise<NextResponse> {
  const url = `${BACKEND_URL}/auth/${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = JSON.stringify(await req.json());
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'PROXY_ERROR', message: 'Backend tidak tersedia' } },
      { status: 503 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { route: string[] } }
): Promise<NextResponse> {
  const path = params.route.join('/');
  return proxyRequest(req, path);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { route: string[] } }
): Promise<NextResponse> {
  const path = params.route.join('/');
  return proxyRequest(req, path);
}
