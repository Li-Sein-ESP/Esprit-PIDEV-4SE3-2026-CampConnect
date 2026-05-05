export enum NotificationType {
    INVITE_RECEIVED = 'INVITE_RECEIVED',
    INVITE_ACCEPTED = 'INVITE_ACCEPTED',
    RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
    TRIP_RECOMMENDATION = 'TRIP_RECOMMENDATION',
    TASK_UPDATE = 'TASK_UPDATE'
}

export interface AppNotification {
    id: string;
    recipientUserId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedEntityId?: string;
    read: boolean;
    createdAt: string;
}
