import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // Validate secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret' },
      { status: 401 }
    );
  }

  // Validate path
  if (!path) {
    return NextResponse.json(
      { message: 'Path is required' },
      { status: 400 }
    );
  }

  try {
    // Revalidate the path
    revalidatePath(path);
    
    // Also revalidate catch-all route
    const slug = path.replace('/page/', '');
    revalidatePath(`/${slug}`);

    return NextResponse.json({
      revalidated: true,
      paths: [path, `/${slug}`],
      now: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    );
  }
}
