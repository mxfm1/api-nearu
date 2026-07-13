import { eq, inArray, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { threads, applications, profiles, events } from '@/src/shared/database/schema';
import type { IThreadsRepository } from './threads.repository.interface';
import type { Thread, ThreadWithDetails, ThreadStatus } from '../entities/thread.entity';

export class ThreadsRepository implements IThreadsRepository {
  async findById(id: string): Promise<Thread | null> {
    try {
      const result = await db
        .select()
        .from(threads)
        .where(eq(threads.id, id))
        .limit(1);

      return result[0] as Thread | null;
    } catch (error) {
      console.error('[ThreadsRepository.findById] Error:', error);
      throw error;
    }
  }

  async findByApplicationId(applicationId: string): Promise<Thread | null> {
    try {
      const result = await db
        .select()
        .from(threads)
        .where(eq(threads.applicationId, applicationId))
        .limit(1);

      return result[0] as Thread | null;
    } catch (error) {
      console.error('[ThreadsRepository.findByApplicationId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    applicationId: string;
    status?: ThreadStatus;
  }): Promise<Thread> {
    try {
      const result = await db
        .insert(threads)
        .values({
          id: crypto.randomUUID(),
          applicationId: data.applicationId,
          status: data.status ?? 'OPEN',
        })
        .returning();

      return result[0] as Thread;
    } catch (error) {
      console.error('[ThreadsRepository.create] Error:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: ThreadStatus): Promise<Thread> {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === 'CLOSED') {
        updateData.closedAt = new Date();
      }

      const result = await db
        .update(threads)
        .set(updateData)
        .where(eq(threads.id, id))
        .returning();

      return result[0] as Thread;
    } catch (error) {
      console.error('[ThreadsRepository.updateStatus] Error:', error);
      throw error;
    }
  }

  async findByIdWithDetails(id: string): Promise<ThreadWithDetails | null> {
    try {
      // Get thread with application and event info
      const threadResult = await db
        .select({
          thread: threads,
          applicantProfileId: applications.applicantProfileId,
          eventId: applications.eventId,
          eventTitle: events.title,
          organizerProfileId: events.profileId,
        })
        .from(threads)
        .where(eq(threads.id, id))
        .leftJoin(applications, eq(threads.applicationId, applications.id))
        .leftJoin(events, eq(applications.eventId, events.id))
        .limit(1);

      if (!threadResult[0] || !threadResult[0].thread) return null;

      const { thread, applicantProfileId, eventId, eventTitle, organizerProfileId } = threadResult[0];

      // Get applicant profile
      let applicantName = '';
      let applicantLogoUrl: string | null = null;
      let applicantUserId = '';

      if (applicantProfileId) {
        const applicantResult = await db
          .select({ name: profiles.name, logoUrl: profiles.logoUrl, userId: profiles.userId })
          .from(profiles)
          .where(eq(profiles.id, applicantProfileId))
          .limit(1);
        applicantName = applicantResult[0]?.name ?? '';
        applicantLogoUrl = applicantResult[0]?.logoUrl ?? null;
        applicantUserId = applicantResult[0]?.userId ?? '';
      }

      // Get organizer profile
      let organizerName = '';
      let organizerLogoUrl: string | null = null;
      let organizerUserId = '';

      if (organizerProfileId) {
        const organizerResult = await db
          .select({ name: profiles.name, logoUrl: profiles.logoUrl, userId: profiles.userId })
          .from(profiles)
          .where(eq(profiles.id, organizerProfileId))
          .limit(1);
        organizerName = organizerResult[0]?.name ?? '';
        organizerLogoUrl = organizerResult[0]?.logoUrl ?? null;
        organizerUserId = organizerResult[0]?.userId ?? '';
      }

      return {
        id: thread.id,
        applicationId: thread.applicationId,
        status: thread.status as ThreadStatus,
        closedAt: thread.closedAt,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        applicationTitle: eventTitle ?? '',
        applicantProfileId: applicantProfileId ?? '',
        applicantUserId,
        applicantName,
        applicantLogoUrl,
        organizerProfileId: organizerProfileId ?? '',
        organizerUserId,
        organizerName,
        organizerLogoUrl,
        lastMessageAt: null,
        unreadCount: 0,
      };
    } catch (error) {
      console.error('[ThreadsRepository.findByIdWithDetails] Error:', error);
      throw error;
    }
  }

  async findByParticipantProfileIds(profileIds: string[]): Promise<ThreadWithDetails[]> {
    if (profileIds.length === 0) return [];

    try {
      // Get threads where user is applicant (applications.applicantProfileId in profileIds)
      const applicantThreads = await db
        .select({
          thread: threads,
          applicantProfileId: applications.applicantProfileId,
          eventId: applications.eventId,
          eventTitle: events.title,
          organizerProfileId: events.profileId,
        })
        .from(threads)
        .leftJoin(applications, eq(threads.applicationId, applications.id))
        .leftJoin(events, eq(applications.eventId, events.id))
        .where(inArray(applications.applicantProfileId, profileIds))
        .orderBy(desc(threads.updatedAt));

      // Get events where user is organizer (profileId in profileIds)
      const organizerEvents = await db
        .select({ id: events.id })
        .from(events)
        .where(inArray(events.profileId, profileIds));

      const organizerEventIds = organizerEvents.map((e) => e.id);

      // Get applications for those events
      let organizerApplications: { id: string }[] = [];
      if (organizerEventIds.length > 0) {
        organizerApplications = await db
          .select({ id: applications.id })
          .from(applications)
          .where(inArray(applications.eventId, organizerEventIds));
      }

      const organizerApplicationIds = organizerApplications.map((a) => a.id);

      // Get threads where user is organizer (threads.applicationId in organizerApplicationIds)
      let organizerThreads: typeof applicantThreads = [];
      if (organizerApplicationIds.length > 0) {
        organizerThreads = await db
          .select({
            thread: threads,
            applicantProfileId: applications.applicantProfileId,
            eventId: applications.eventId,
            eventTitle: events.title,
            organizerProfileId: events.profileId,
          })
          .from(threads)
          .leftJoin(applications, eq(threads.applicationId, applications.id))
          .leftJoin(events, eq(applications.eventId, events.id))
          .where(inArray(threads.applicationId, organizerApplicationIds))
          .orderBy(desc(threads.updatedAt));
      }

      // Combine and deduplicate by thread id
      const allThreadsMap = new Map<string, typeof applicantThreads[0]>();
      [...applicantThreads, ...organizerThreads].forEach((row) => {
        if (row.thread) {
          allThreadsMap.set(row.thread.id, row);
        }
      });

      // Build detailed threads
      const result: ThreadWithDetails[] = [];

      for (const row of allThreadsMap.values()) {
        const { thread, applicantProfileId, eventId, eventTitle, organizerProfileId } = row;
        if (!thread) continue;

        // Get applicant profile details
        let applicantName = '';
        let applicantLogoUrl: string | null = null;
        let applicantUserId = '';
        if (applicantProfileId) {
          const applicantResult = await db
            .select({ name: profiles.name, logoUrl: profiles.logoUrl, userId: profiles.userId })
            .from(profiles)
            .where(eq(profiles.id, applicantProfileId))
            .limit(1);
          applicantName = applicantResult[0]?.name ?? '';
          applicantLogoUrl = applicantResult[0]?.logoUrl ?? null;
          applicantUserId = applicantResult[0]?.userId ?? '';
        }

        // Get organizer profile details
        let organizerName = '';
        let organizerLogoUrl: string | null = null;
        let organizerUserId = '';
        if (organizerProfileId) {
          const organizerResult = await db
            .select({ name: profiles.name, logoUrl: profiles.logoUrl, userId: profiles.userId })
            .from(profiles)
            .where(eq(profiles.id, organizerProfileId))
            .limit(1);
          organizerName = organizerResult[0]?.name ?? '';
          organizerLogoUrl = organizerResult[0]?.logoUrl ?? null;
          organizerUserId = organizerResult[0]?.userId ?? '';
        }

        result.push({
          id: thread.id,
          applicationId: thread.applicationId,
          status: thread.status as ThreadStatus,
          closedAt: thread.closedAt,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          applicationTitle: eventTitle ?? '',
          applicantProfileId: applicantProfileId ?? '',
          applicantUserId,
          applicantName,
          applicantLogoUrl,
          organizerProfileId: organizerProfileId ?? '',
          organizerUserId,
          organizerName,
          organizerLogoUrl,
          lastMessageAt: null,
          unreadCount: 0,
        });
      }

      // Sort by updatedAt desc
      result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return result;
    } catch (error) {
      console.error('[ThreadsRepository.findByParticipantProfileIds] Error:', error);
      throw error;
    }
  }
}
