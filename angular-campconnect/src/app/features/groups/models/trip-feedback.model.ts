export interface TripFeedback {
    id?: string;
    tripIntentId: string;
    groupId: string;
    evaluatorUserId: string;
    evaluatedUserId: string;
    opennessScore: number;
    conscientiousnessScore: number;
    extraversionScore: number;
    agreeablenessScore: number;
    neuroticismScore: number;
    isCompatible: boolean;
    createdAt?: string;
}
