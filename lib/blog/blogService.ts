import { Post, CreatePostData, UpdatePostData, Comment } from './blogTypes';

const API_URL = '/api/blog';

export async function getPosts(page = 1, limit = 10): Promise<{ posts: Post[]; total: number }> {
  const response = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

export async function getPost(id: string): Promise<Post> {
  const response = await fetch(`${API_URL}/posts/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

export async function updatePost(data: UpdatePostData): Promise<Post> {
  const response = await fetch(`${API_URL}/posts/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }

  return response.json();
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  return response.json();
}

export async function likePost(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${id}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }
}