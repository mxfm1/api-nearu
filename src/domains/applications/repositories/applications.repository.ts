import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { applications, events, profiles, users, locations, statuses, applicationScores, applicationScoreBreakdown } from '@/src/shared/database/schema';
import type { IApplicationsRepository } from './applications.repository.interface';
import type { Application, ApplicationWithDetails, ApplicationScoreWithBreakdown } from '../entities/application.entity';

function mapApplicationRow(row: any): ApplicationWithDetails {
  return {
    id: row.application.id,
    eventId: row.application.eventId,
    applicantProfileId: row.application.applicantProfileId,
    coverLetter: row.application.coverLetter,
    portfolioUrls: (row.application.portfolioUrls as string[]) ?? [],
    status: row.application.status as ApplicationWithDetails['status'],
    createdAt: row.application.createdAt,
    updatedAt: row.application.updatedAt,
    eventTitle: row.eventTitle ?? null,
    eventStartAt: row.eventStartAt ?? null,
    eventStatusSlug: row.eventStatusSlug ?? null,
    applicantName: row.applicantName ?? null,
    applicantLogoUrl: row.applicantLogoUrl ?? null,
    locationName: row.locationName ?? null,
  };
}

export class ApplicationsRepository implements IApplicationsRepository {
  async findById(id: string): Promise<ApplicationWithDetails | null> {
    try {
      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          locationName: locations.name,
        })
        .from(applications)
        .where(eq(applications.id, id))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(locations, eq(profiles.locationId, locations.id))
        .limit(1);

      if (!result[0]) return null;
      return mapApplicationRow(result[0]);
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

  async findByEventId(eventId: string): Promise<ApplicationWithDetails[]> {
    try {
      const result = await db
        .select({
          application: applications,
          eventTitle: events.title,
          eventStartAt: events.startAt,
          eventStatusSlug: statuses.slug,
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          locationName: locations.name,
        })
        .from(applications)
        .where(eq(applications.eventId, eventId))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(locations, eq(profiles.locationId, locations.id))
        .orderBy(desc(applications.createdAt));

      return result.map(mapApplicationRow);
    } catch (error) {
      console.error('[ApplicationsRepository.findByEventId] Error:', error);
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
          applicantName: profiles.name,
          applicantLogoUrl: profiles.logoUrl,
          locationName: locations.name,
        })
        .from(applications)
        .where(eq(applications.applicantProfileId, applicantProfileId))
        .leftJoin(events, eq(applications.eventId, events.id))
        .leftJoin(statuses, eq(events.statusId, statuses.id))
        .leftJoin(profiles, eq(applications.applicantProfileId, profiles.id))
        .leftJoin(locations, eq(profiles.locationId, locations.id))
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
        })
        .returning();
      return result[0] as Application;
    } catch (error) {
      console.error('[ApplicationsRepository.create] Error:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string): Promise<Application> {
    try {
      const result = await db
        .update(applications)
        .set({ status, updatedAt: new Date() })
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
