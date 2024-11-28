export interface Tag {
  id: string;
  name: string;
  color?: string;
  type: 'template' | 'report' | 'document';
  createdAt: string;
  updatedAt: string;
}

export interface TagsIndex {
  tags: Tag[];
  relations: {
    [type: string]: {
      byItem: { [itemId: string]: string[] };  // 项目 -> 标签
      byTag: { [tagId: string]: string[] };    // 标签 -> 项目
    }
  }
}

export type TagType = 'template' | 'report' | 'document';

export interface TagRelations {
  byItem: { [itemId: string]: string[] };
  byTag: { [tagId: string]: string[] };
}