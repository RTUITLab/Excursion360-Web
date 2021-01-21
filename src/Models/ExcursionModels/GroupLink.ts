import { StateItem } from "./StateItem";
/**
 * Group link to several another states
 */
export interface GroupLink extends StateItem {
    /** Title of link */
    title: string;
    /** Ids of connected states */
    stateIds: string[];
    /** Overrides of state step angles */
    groupStateRotationOverrides: { stateId: string, rotationAfterStepAngle: number }[];
    /** Additional info under buttons*/
    infos: string[];
    /**
     * Minimize modifier for label
     */
    minimizeScale: number;
}