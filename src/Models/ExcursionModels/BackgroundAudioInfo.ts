import type { ContentItemModel } from "./ContentItemModel";

/** Аудио на фоне во время воспроизведения экскурсии */
export interface BackgroundAudioInfo {
	id: string;
	loopAudios: boolean;
	audios: string[];
	/**
	 * Таймер для частного проекта, который необходим по ТЗ, но не готов к полноценной реализации на стороне редактора/отображающего кода
	 */
	tempTimers?: TempTimer[];
}

export interface TempTimer {
	start: number;
	end: number;
	content: ContentItemModel;
}
