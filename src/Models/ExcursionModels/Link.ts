import { StateItem } from "./StateItem";

/**
 * Link to another state
 */
export interface Link extends StateItem {
    /** State id */
    id: string;
    /** Id of color scheme */
    colorScheme: number;
}
