import type { FieldItemAudioContent } from "./FieldItemAudioContent";

/** Наполнение интерактивного контента - изображения */
export interface FieldItemImageContent {
	/** Путь к изображению - обязательный параметр */
	imageSrc: string;

	/** Описание изображения для отображения в интерфейсе - опциональный параметр */
	description: string | null;
	/** Описание изображения для отображения в интерфейсе - опциональный параметр */
	audio: FieldItemAudioContent | null;
}
