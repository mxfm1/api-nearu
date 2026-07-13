export type ThreadStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface Thread {
  id: string;
  applicationId: string;
  status: ThreadStatus;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreadWithDetails extends Thread {
  applicationTitle: string;
  applicantProfileId: string;
  applicantUserId: string;
  applicantName: string;
  applicantLogoUrl: string | null;
  organizerProfileId: string;
  organizerUserId: string;
  organizerName: string;
  organizerLogoUrl: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
}
