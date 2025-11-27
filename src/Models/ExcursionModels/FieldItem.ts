import type { FieldItemAudioContent } from "./FieldItemAudioContent";
import type { FieldItemImageContent } from "./FieldItemImageContent";

/** Интерактивный элемент */
export class FieldItem {
	/** Название интерактивного элемента */
	title: string;
	/** Вершины-квантернионы */
	vertices: any[];
	/** Набор блоков-изображений для отображения внутри интерактивного элемента */
	imageContent: FieldItemImageContent[];
	/** Список ссылок на ресурсы - видео ролики, отображаемые внутри интерактивного элемента */
	videos: string[];
	/** Текст-описание к интерактивному элементу */
	text: string;
	audios: FieldItemAudioContent[];
}
