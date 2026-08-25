import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { profiles, requests } from '@/src/shared/database/schema';
import type { RequestStatus, RequestType, UserRequest } from '../entities/request.entity';
import type { IRequestsRepository } from './requests.repository.interface';

export class RequestsRepository implements IRequestsRepository {
  async create(data: {
    profileId: string;
    type: RequestType;
    title: string;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
    targetEntityType?: string | null;
    targetEntityId?: string | null;
  }): Promise<UserRequest> {
    const result = await db.insert(requests).values({
      id: crypto.randomUUID(),
      profileId: data.profileId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      metadata: data.metadata ?? null,
      targetEntityType: data.targetEntityType as any ?? null,
      targetEntityId: data.targetEntityId ?? null,
    }).returning();
    return result[0] as unknown as UserRequest;
  }

  async findById(id: string): Promise<UserRequest | null> {
    const result = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
    return (result[0] as unknown as UserRequest) ?? null;
  }

  async findPendingByProfileAndType(profileId: string, type: RequestType): Promise<UserRequest | null> {
    const result = await db.select().from(requests).where(and(
      eq(requests.profileId, profileId),
      eq(requests.type, type),
      eq(requests.status, 'pending'),
    )).limit(1);
    return (result[0] as unknown as UserRequest) ?? null;
  }

  async listByProfile(profileId: string, status?: RequestStatus): Promise<UserRequest[]> {
    const filters = [eq(requests.profileId, profileId)];
    if (status) filters.push(eq(requests.status, status));
    const result = await db.select().from(requests)
      .where(and(...filters))
      .orderBy(desc(requests.createdAt));
    return result as unknown as UserRequest[];
  }

  async list(status?: RequestStatus): Promise<UserRequest[]> {
    const result = await db.select().from(requests)
      .where(status ? eq(requests.status, status) : undefined)
      .orderBy(desc(requests.createdAt));
    return result as unknown as UserRequest[];
  }

  async updateStatus(id: string, data: {
    status: RequestStatus;
    reviewerUserId: string;
    reviewerComment?: string | null;
    reviewedAt?: Date | null;
    verifyProfile?: boolean;
  }): Promise<UserRequest | null> {
    return db.transaction(async (tx) => {
      if (data.verifyProfile) {
        const request = await tx.select({ profileId: requests.profileId })
          .from(requests)
          .where(eq(requests.id, id))
          .limit(1);
        if (request[0]) {
          await tx.update(profiles)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(eq(profiles.id, request[0].profileId));
        }
      }

      const result = await tx.update(requests).set({
        status: data.status,
        reviewerUserId: data.reviewerUserId,
        reviewerComment: data.reviewerComment ?? null,
        reviewedAt: data.reviewedAt ?? new Date(),
        updatedAt: new Date(),
      }).where(eq(requests.id, id)).returning();
      return (result[0] as unknown as UserRequest) ?? null;
    });
  }
}
