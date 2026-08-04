export enum WorkOrderCategory {
  Maintenance = 'MAINTENANCE',
  Cleaning = 'CLEANING',
  Security = 'SECURITY',
  Noise = 'NOISE',
  Other = 'OTHER',
}

export enum WorkOrderPriority {
  Low = 'LOW',
  Normal = 'NORMAL',
  High = 'HIGH',
  Urgent = 'URGENT',
}

export enum WorkOrderStatus {
  Open = 'OPEN',
  InProgress = 'IN_PROGRESS',
  Resolved = 'RESOLVED',
  Cancelled = 'CANCELLED',
}
