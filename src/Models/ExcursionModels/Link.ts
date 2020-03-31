import { StateItem } from "./StateItem";

/**
 * Link to another state
 */
export interface Link extends StateItem {
    /** State id */
    id: string;
    /** Id of color scheme */
    colorScheme: number;
    /** Is camera rotation after step must be update */
    rotationAfterStepAngleOverridden: boolean;
    /** Rotation camera angle */
    rotationAfterStepAngle: number;
}
