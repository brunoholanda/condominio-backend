export enum VisitorPassStatus {
  Pending = 'PENDING',
  CheckedIn = 'CHECKED_IN',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
}

export const VISITOR_PASS_STATUSES = Object.values(VisitorPassStatus);
