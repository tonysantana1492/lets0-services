import type { IAuthor } from './author.interface';

export interface IComment {
  type?: string;

  note: string;

  files?: string[];

  postedAs?: string;

  author: IAuthor;

  createdAt: string;
}
