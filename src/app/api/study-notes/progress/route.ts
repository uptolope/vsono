import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProgressSchema = z.object({
  chapterId: z.number(),
  progress: z.number().min(0).max(100),
  bookmarks: z.array(z.number()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkContentAccess(userId, 'STUDY_NOTES');
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { chapterId, progress, bookmarks } = parsed.data;

  try {
    const updated = await prisma.studyNoteProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      create: {
        userId,
        chapterId,
        progress,
        bookmarks,
      },
      update: {
        progress,
        bookmarks,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[study-notes/progress] Error saving progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkContentAccess(userId, 'STUDY_NOTES');
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const progress = await prisma.studyNoteProgress.findMany({
      where: { userId },
      select: {
        chapterId: true,
        progress: true,
        bookmarks: true,
      },
    });

    const totalChapters = progress.length;
    const averageProgress = totalChapters > 0 ? progress.reduce((sum, p) => sum + p.progress, 0) / totalChapters : 0;
    const completedChapters = progress.filter((p) => p.progress === 100).length;

    return NextResponse.json({
      progress,
      stats: {
        totalChapters,
        completedChapters,
        averageProgress: Math.round(averageProgress * 100) / 100,
        completionPercentage: (completedChapters / totalChapters) * 100,
      },
    });
  } catch (error) {
    console.error('[study-notes/progress] Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
