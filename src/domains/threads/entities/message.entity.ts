export type MessageType = 'TEXT' | 'SYSTEM' | 'FILE' | 'IMAGE' | 'MIXED';

export interface Message {
  id: string;
  threadId: string;
  senderProfileId: string;
  content: string | null;
  messageType: MessageType;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageWithSender extends Message {
  senderName: string;
  senderLogoUrl: string | null;
}

export interface MessageWithAttachments extends MessageWithSender {
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  type: 'IMAGE' | 'FILE' | 'VIDEO';
  mimeType: string;
  size: number;
  name: string;
  createdAt: Date;
}
