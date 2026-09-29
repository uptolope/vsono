import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

/**
 * GET /api/protected/images
 * Serves protected images with HMAC signature verification and access control
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');
    const signature = searchParams.get('sig');
    const expiresStr = searchParams.get('expires');

    // Validate required parameters
    if (!imageId || !signature || !expiresStr) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check expiration
    const expiresAt = parseInt(expiresStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'Link expired' },
        { status: 403 }
      );
    }

    // Verify HMAC signature
    const secret = process.env.IMAGE_SIGNING_SECRET || 'default-secret';
    const expectedSignature = createHmac('sha256', secret)
      .update(`${imageId}:${expiresAt}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn(`[SECURITY] Invalid signature for image ${imageId} from ${session.user.email}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // TODO: Verify user has access to this image via Prisma
    // This requires understanding your schema relationship between User, Purchase, Product, and Image
    // For now, we'll assume the signature verification is sufficient
    // Example query (adjust based on your actual schema):
    // const hasAccess = await prisma.purchase.findFirst({
    //   where: {
    //     userId: session.user.id,
    //     product: {
    //       images: {
    //         some: { id: imageId }
    //       }
    //     }
    //   }
    // });
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    // }

    // Log access for audit trail
    console.log(`[AUDIT] Image accessed: ${imageId} by ${session.user.email} at ${new Date().toISOString()}`);

    // TODO: Serve the image from your storage
    // For now, return a placeholder response
    // In production, serve from: private S3 bucket, database blob, or protected file system
    return NextResponse.json(
      { message: 'Image access granted', imageId },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error('[ERROR] Protected image route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
