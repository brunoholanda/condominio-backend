export enum NotificationCategory {
  Charge = 'CHARGE',
  Visitor = 'VISITOR',
  WorkOrder = 'WORK_ORDER',
  Absence = 'ABSENCE',
  System = 'SYSTEM',
}

export const NOTIFICATION_CATEGORIES = Object.values(NotificationCategory);
