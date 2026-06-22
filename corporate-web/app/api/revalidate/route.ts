import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { clearCmsDataCache } from '@/lib/cmsApi';

const MAX_REVALIDATE_PATH_LENGTH = 512;

function getValidatedPath(path: unknown): string | null {
  if (typeof path !== 'string') {
    return null;
  }

  const trimmedPath = path.trim();

  if (
    trimmedPath.length === 0 ||
    trimmedPath.length > MAX_REVALIDATE_PATH_LENGTH ||
    !trimmedPath.startsWith('/') ||
    trimmedPath.startsWith('//') ||
    /[\u0000-\u001f\u007f]/.test(trimmedPath)
  ) {
    return null;
  }

  return trimmedPath;
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  const providedSecret = request.headers.get('x-revalidate-secret');

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const path = getValidatedPath((payload as { path?: unknown })?.path);

  if (!path) {
    return NextResponse.json({ success: false, message: 'Invalid revalidation path' }, { status: 400 });
  }

  clearCmsDataCache();
  revalidatePath(path);

  return NextResponse.json({ success: true, path });
}
