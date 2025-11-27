export interface ContentItemModel {
	orientation: any;
	contentType: ContentItemType;
	multipler: number;
	image?: string;
}

export enum ContentItemType {
	Unknown = 0,
	Image = 1,
}
