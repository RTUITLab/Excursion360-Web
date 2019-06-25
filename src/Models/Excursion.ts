import { State as State } from "./State";

/**
 * Excursion object, present start point and all states
 */
export interface Excursion {
    /**
     * Id of first state to show
     */
    firstStateId: string;
    /**
     * All states in excursion
     */
    states: State[];
}