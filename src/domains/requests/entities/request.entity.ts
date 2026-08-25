export const REQUEST_TYPES = [
  'profile_verification',
  'profile_report',
  'publication_report',
  'withdrawal',
  'general_question',
  'feedback',
] as const;

export const REQUEST_STATUSES = [
  'pending',
  'in_review',
  'approved',
  'rejected',
  'resolved',
  'cancelled',
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface UserRequest {
  id: string;
  profileId: string;
  type: RequestType;
  status: RequestStatus;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  targetEntityType: string | null;
  targetEntityId: string | null;
  reviewerUserId: string | null;
  reviewerComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
}
