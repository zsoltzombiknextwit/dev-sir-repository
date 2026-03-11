export interface CommentRecord {
  id: string;
  text: string;
  authorName: string;
  authorId?: string;
  createdOn: Date;
  modifiedOn?: Date;
  parentId?: string;
  replies?: CommentRecord[];
}
