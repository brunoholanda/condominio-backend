export enum TicketStatus {
  Open = 'OPEN',
  InProgress = 'IN_PROGRESS',
  Resolved = 'RESOLVED',
  Closed = 'CLOSED',
}

export const TICKET_STATUSES = Object.values(TicketStatus);
