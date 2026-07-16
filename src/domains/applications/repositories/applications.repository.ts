import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { applications, events, profiles, users, statuses, applicationScores, applicationScoreBreakdown, regions } from '@/src/shared/database/schema';
import type { IApplicationsRepository } from './applications.repository.interface';
import type { Application, ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';

function mapApplicationRow(row: any): ApplicationWithDetails {
  return {
    id: row.application.id,
    eventId: row.application.eventId,
    applicantProfileId: row.application.applicantProfileId,
    coverLetter: row.application.coverLetter,
    portfolioUrls: (row.application.portfolioUrls as string[]) ?? [],
    statusId: row.application.statusId,
    createdAt: row.application.createdAt,
    updatedAt: row.application.updatedAt,
    eventTitle: row.eventTitle ?? null,
    eventStartAt: row.eventStartAt ?? null,
    eventStatusSlug: row.eventStatusSlug ?? null,
    eventStatusName: row.eventStatusName ?? null,
    applicantName: row.applicantName ?? null,
    applicantLogoUrl: row.applicantLogoUrl ?? null,
    regionName: row.regionName ?? null,
    score: row.totalScore != null
      ? {
        totalScore: row.totalScore,
        maxPossible: row.maxPossible,
        computedAt: null,
        breakdown: [],
      }
      : undefined,
  };
}

export class ApplicationsRepository implements IApplicationsRepository {
  async findById(id: string): Promise<ApplicationWithDetails | null> {
    try {
      // Get application with basic details
      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          eventStatusName: statuses.name,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          regionName: regions.name,
        })
        .from(applications)
        .where(eq(applications.id, id))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(applications.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(regions, eq(profiles.regionId, regions.id))
        .limit(1);

      if (!result[0]) return null;

      const row = result[0];

      // Get organizer profile name separately
      let organizerProfileName: string | null = null;
      if (row.application.eventId) {
        const eventResult = await db
          .select({ profileName: profiles.name })
          .from(events)
          .leftJoin(profiles, eq(events.profileId, profiles.id))
          .where(eq(events.id, row.application.eventId))
          .limit(1);
        organizerProfileName = eventResult[0]?.profileName ?? null;
      }

      // Get score and breakdown
      const scoreResult = await db
        .select()
        .from(applicationScores)
        .where(eq(applicationScores.applicationId, id))
        .limit(1);

      let breakdown: any[] = [];
      if (scoreResult[0]) {
        const breakdownResult = await db
          .select()
          .from(applicationScoreBreakdown)
          .where(eq(applicationScoreBreakdown.scoreId, scoreResult[0].id));
        breakdown = breakdownResult;
      }

      return {
        id: row.application.id,
        eventId: row.application.eventId,
        applicantProfileId: row.application.applicantProfileId,
        coverLetter: row.application.coverLetter,
        portfolioUrls: (row.application.portfolioUrls as string[]) ?? [],
        statusId: row.application.statusId,
        createdAt: row.application.createdAt,
        updatedAt: row.application.updatedAt,
        eventTitle: row.eventTitle ?? null,
        eventStartAt: row.eventStartAt ?? null,
        eventStatusSlug: row.eventStatusSlug ?? null,
        eventStatusName: row.eventStatusName ?? null,
        applicantName: row.applicantName ?? null,
        applicantLogoUrl: row.applicantLogoUrl ?? null,
        regionName: row.regionName ?? null,
        organizerProfileName: organizerProfileName,
        score: scoreResult[0]
          ? {
              totalScore: scoreResult[0].totalScore,
              maxPossible: scoreResult[0].maxPossible,
              computedAt: scoreResult[0].computedAt,
              breakdown: breakdown.map((b) => ({
                ruleType: b.ruleType,
                pointsEarned: b.pointsEarned,
                pointsPossible: b.pointsPossible,
                reason: b.reason,
              })),
            }
          : undefined,
      };
    } catch (error) {
      console.error('[ApplicationsRepository.findById] Error:', error);
      throw error;
    }
  }

  async findByEventAndProfile(eventId: string, applicantProfileId: string): Promise<Application | null> {
    try {
      const result = await db
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.eventId, eventId),
            eq(applications.applicantProfileId, applicantProfileId)
          )
        )
        .limit(1);

      if (!result[0]) return null;
      return result[0] as Application;
    } catch (error) {
      console.error('[ApplicationsRepository.findByEventAndProfile] Error:', error);
      throw error;
    }
  }

  async findByEventId(
    eventId: string,
    options?: { status?: string }
  ): Promise<ApplicationWithDetails[]> {
    try {
      const conditions = [eq(applications.eventId, eventId)];

      // Filter by status if provided
      if (options?.status) {
        conditions.push(eq(statuses.slug, options.status));
      }

      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          eventStatusName: statuses.name,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          regionName: regions.name,
          totalScore: applicationScores.totalScore,
          maxPossible: applicationScores.maxPossible,
        })
        .from(applications)
        .where(and(...conditions))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(applications.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(regions, eq(profiles.regionId, regions.id))
        .leftJoin(applicationScores, eq(applications.id, applicationScores.applicationId))
        .orderBy(desc(applicationScores.totalScore), desc(applications.createdAt));

      return result.map(mapApplicationRow);
    } catch (error) {
      console.error('[ApplicationsRepository.findByEventId] Error:', error);
      throw error;
    }
  }

  async findByEventIdWithScoreDetails(
    eventId: string,
    options?: { status?: string }
  ): Promise<ApplicationWithDetails[]> {
    try {
      const conditions = [eq(applications.eventId, eventId)];

      if (options?.status) {
        conditions.push(eq(statuses.slug, options.status));
      }

      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          eventStatusName: statuses.name,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          regionName: regions.name,
          totalScore: applicationScores.totalScore,
          maxPossible: applicationScores.maxPossible,
          computedAt: applicationScores.computedAt,
          scoreId: applicationScores.id,
        })
        .from(applications)
        .where(and(...conditions))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(applications.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(regions, eq(profiles.regionId, regions.id))
        .leftJoin(applicationScores, eq(applications.id, applicationScores.applicationId))
        .orderBy(desc(applicationScores.totalScore), desc(applications.createdAt));

      // Get breakdown for each application
      const applicationsWithBreakdown = await Promise.all(
        result.map(async (row) => {
          let breakdown: any[] = [];
          if (row.scoreId) {
            const breakdownResult = await db
              .select()
              .from(applicationScoreBreakdown)
              .where(eq(applicationScoreBreakdown.scoreId, row.scoreId));
            breakdown = breakdownResult;
          }

          return {
            id: row.application.id,
            eventId: row.application.eventId,
            applicantProfileId: row.application.applicantProfileId,
            coverLetter: row.application.coverLetter,
            portfolioUrls: (row.application.portfolioUrls as string[]) ?? [],
            statusId: row.application.statusId,
            createdAt: row.application.createdAt,
            updatedAt: row.application.updatedAt,
            eventTitle: row.eventTitle ?? null,
            eventStartAt: row.eventStartAt ?? null,
            eventStatusSlug: row.eventStatusSlug ?? null,
            eventStatusName: row.eventStatusName ?? null,
            applicantName: row.applicantName ?? null,
            applicantLogoUrl: row.applicantLogoUrl ?? null,
            regionName: row.regionName ?? null,
            score: row.totalScore != null
              ? {
                totalScore: row.totalScore,
                maxPossible: row.maxPossible,
                computedAt: row.computedAt,
                breakdown: breakdown.map((b) => ({
                  ruleType: b.ruleType,
                  pointsEarned: b.pointsEarned,
                  pointsPossible: b.pointsPossible,
                  reason: b.reason,
                })),
              }
              : undefined,
          };
        })
      );

      return applicationsWithBreakdown;
    } catch (error) {
      console.error('[ApplicationsRepository.findByEventIdWithScoreDetails] Error:', error);
      throw error;
    }
  }

  async findByApplicantProfileId(applicantProfileId: string): Promise<ApplicationWithDetails[]> {
    try {
      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          eventStatusName: statuses.name,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          regionName: regions.name,
        })
        .from(applications)
        .where(eq(applications.applicantProfileId, applicantProfileId))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(applications.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(regions, eq(profiles.regionId, regions.id))
        .orderBy(desc(applications.createdAt));

      return result.map(mapApplicationRow);
    } catch (error) {
      console.error('[ApplicationsRepository.findByApplicantProfileId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    eventId: string;
    applicantProfileId: string;
    coverLetter?: string | null;
    portfolioUrls?: string[];
    statusId?: string;
  }): Promise<Application> {
    try {
      const result = await db
        .insert(applications)
        .values({
          id: crypto.randomUUID(),
          eventId: data.eventId,
          applicantProfileId: data.applicantProfileId,
          coverLetter: data.coverLetter ?? null,
          portfolioUrls: data.portfolioUrls ?? [],
          statusId: data.statusId ?? '10000000-0000-0000-0000-000000000001', // Default: pending
        })
        .returning();
      return result[0] as Application;
    } catch (error) {
      console.error('[ApplicationsRepository.create] Error:', error);
      throw error;
    }
  }

  async updateStatus(id: string, statusId: string): Promise<Application> {
    try {
      const result = await db
        .update(applications)
        .set({ statusId, updatedAt: new Date() })
        .where(eq(applications.id, id))
        .returning();
      return result[0] as Application;
    } catch (error) {
      console.error('[ApplicationsRepository.updateStatus] Error:', error);
      throw error;
    }
  }

  async findScoreByApplicationId(applicationId: string): Promise<ApplicationScoreWithBreakdown | null> {
    try {
      const scoreResult = await db
        .select()
        .from(applicationScores)
        .where(eq(applicationScores.applicationId, applicationId))
        .limit(1);

      if (!scoreResult[0]) return null;

      const breakdownResult = await db
        .select()
        .from(applicationScoreBreakdown)
        .where(eq(applicationScoreBreakdown.scoreId, scoreResult[0].id));

      return {
        ...(scoreResult[0] as ApplicationScoreWithBreakdown),
        breakdown: breakdownResult as any[],
      };
    } catch (error) {
      console.error('[ApplicationsRepository.findScoreByApplicationId] Error:', error);
      throw error;
    }
  }

  async upsertScore(data: {
    applicationId: string;
    totalScore: number;
    maxPossible: number;
    breakdown: Array<{
      ruleType: string;
      pointsEarned: number;
      pointsPossible: number;
      reason?: string | null;
    }>;
  }): Promise<ApplicationScoreWithBreakdown> {
    try {
      // Delete existing score if any
      const existing = await db
        .select()
        .from(applicationScores)
        .where(eq(applicationScores.applicationId, data.applicationId))
        .limit(1);

      if (existing[0]) {
        await db
          .delete(applicationScoreBreakdown)
          .where(eq(applicationScoreBreakdown.scoreId, existing[0].id));
        await db
          .delete(applicationScores)
          .where(eq(applicationScores.id, existing[0].id));
      }

      // Create new score
      const scoreResult = await db
        .insert(applicationScores)
        .values({
          id: crypto.randomUUID(),
          applicationId: data.applicationId,
          totalScore: data.totalScore,
          maxPossible: data.maxPossible,
        })
        .returning();

      const scoreId = scoreResult[0].id;

      // Create breakdown entries
      if (data.breakdown.length > 0) {
        await db.insert(applicationScoreBreakdown).values(
          data.breakdown.map((b) => ({
            id: crypto.randomUUID(),
            scoreId,
            ruleType: b.ruleType as any,
            pointsEarned: b.pointsEarned,
            pointsPossible: b.pointsPossible,
            reason: b.reason ?? null,
          }))
        );
      }

      // Return full score with breakdown
      const breakdownResult = await db
        .select()
        .from(applicationScoreBreakdown)
        .where(eq(applicationScoreBreakdown.scoreId, scoreId));

      return {
        ...(scoreResult[0] as ApplicationScoreWithBreakdown),
        breakdown: breakdownResult as any[],
      };
    } catch (error) {
      console.error('[ApplicationsRepository.upsertScore] Error:', error);
      throw error;
    }
  }
}
