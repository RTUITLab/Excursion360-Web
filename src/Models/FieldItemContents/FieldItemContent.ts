export interface FieldItemContent {
	setIsVisible(visible: boolean): void;
	readonly type: string;
	dispose(): void;
}
