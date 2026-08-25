import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProgressSchema = z.object({
  chapterId: z.number().int().positive(),
  progress: z.number().min(0).max(100),
  timeSpentMs: z.number().int().nonnegative().optional().default(0),
  bookmarks: z.array(z.number().int().positive()).optional().default([]),
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

  const { chapterId, progress, timeSpentMs = 0, bookmarks = [] } = parsed.data;

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
        timeSpentMs,
        lastStudied: new Date(),
      },
      update: {
        progress,
        bookmarks: bookmarks.length > 0 ? bookmarks : undefined,
        timeSpentMs: { increment: timeSpentMs },
        lastStudied: new Date(),
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
    const records = await prisma.studyNoteProgress.findMany({
      where: { userId },
      select: {
        chapterId: true,
        progress: true,
        bookmarks: true,
        timeSpentMs: true,
        lastStudied: true,
      },
    });

    const totalChapters = records.length;
    const totalProgress = records.reduce((sum, p) => sum + (p.progress || 0), 0);
    const completedChapters = records.filter((p) => p.progress === 100).length;
    const averageProgress = totalChapters > 0 ? totalProgress / totalChapters : 0;
    const totalTimeMs = records.reduce((sum, r) => sum + (r.timeSpentMs || 0), 0);

    return NextResponse.json({
      progress: records,
      stats: {
        totalChapters,
        completedChapters,
        averageProgress: Math.round(averageProgress * 100) / 100,
        completionPercentage: totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 10000) / 100 
          : 0,
        totalStudyTimeMinutes: Math.round(totalTimeMs / 60000),
      },
    });
  } catch (error) {
    console.error('[study-notes/progress] Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}