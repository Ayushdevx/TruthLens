export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  postId: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}