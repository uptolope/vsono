import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Protected image endpoint with access control and signing
 * GET /api/protected/images?id=<imageId>&sig=<signature>&expires=<timestamp>
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('id');
    const signature = searchParams.get('sig');
    const expiresStr = searchParams.get('expires');

    if (!imageId || !signature || !expiresStr) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    // Verify signature hasn't expired
    const expiresAt = parseInt(expiresStr, 10);
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'Link expired' },
        { status: 403 },
      );
    }

    // Verify signature is valid
    const secret = process.env.IMAGE_SIGNING_SECRET || 'default-secret';
    const expectedSig = createHmac('sha256', secret)
      .update(`${imageId}:${expiresAt}`)
      .digest('hex');

    if (signature !== expectedSig) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 },
      );
    }

    // Check user has access to this content
    // This depends on your data model - adjust query as needed
    const hasAccess = await checkUserAccess(session.user.id, imageId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      );
    }

    // Log access for audit trail
    console.log(
      `[Protected Image Access] User ${session.user.email} accessed image ${imageId}`,
    );

    // Serve the image
    const imagePath = path.join(
      process.cwd(),
      'public',
      'protected-images',
      `${imageId}.png`, // Adjust extension as needed
    );

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = 'image/png'; // Detect based on extension if needed

    // Set headers to prevent caching and downloading
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Content-Disposition': 'inline; filename="image.png"', // Inline = view only
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('[Protected Image Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Check if user has access to this image
 * Adjust based on your data model
 */
async function checkUserAccess(
  userId: string,
  imageId: string,
): Promise<boolean> {
  try {
    // Example: Check if user has purchased the product that contains this image
    // Adjust this query based on your actual schema
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        product: {
          images: {
            some: {
              id: imageId,
            },
          },
        },
      },
    });

    return !!purchase;
  } catch {
    return false;
  }
}
