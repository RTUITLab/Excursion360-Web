import type { BackgroundAudioInfo } from "./BackgroundAudioInfo";
import type { State } from "./State";

/**
 * Excursion object, present start point and all states
 */
export interface Excursion {
	/**
	 * Unique id of excursion
	 */
	id: string;
	/**
	 * Excursion title
	 */
	title: string;
	/**
	 * Excursion creation time in UTC format
	 */
	buildTime: string;
	/**
	 * Excursion build version number
	 */
	versionNum: number;
	/**
	 * Id of first state to show
	 */
	firstStateId: string;
	/**
	 * Fast return to first state button enabled
	 */
	fastReturnToFirstStateEnabled: boolean;
	/**
	 * All states in excursion
	 */
	states: State[];
	colorSchemes: any[];
	backgroundAudios: BackgroundAudioInfo[];

	/**
	 * Version of protocol
	 */
	tourProtocolVersion: string;
}
