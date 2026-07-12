export interface Message {
  id: string;
  contactRequestId: string;
  senderId: string;
  content: string | null;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageWithSender extends Message {
  senderNombre?: string;
  senderEmail?: string;
  senderImagen?: string | null;
}
