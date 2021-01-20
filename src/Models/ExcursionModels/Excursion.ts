import { State as State } from "./State";
import { TableOfContentRow } from "./TableOfContentRow";

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
    colorSchemes: any[];
    tableOfContent: TableOfContentRow[];
    /**
     * Version of protocol
     */
    tourProtocolVersion: string;
}
