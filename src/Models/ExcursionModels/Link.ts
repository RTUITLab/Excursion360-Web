import { StateItem } from "./StateItem";

/**
 * Link to another state
 */
export interface Link {
    /** State id */
    id: string;
    rotation: any;
    colorScheme: number;
}
