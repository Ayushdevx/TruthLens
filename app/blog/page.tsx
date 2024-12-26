'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Share2, MessageSquare, Bookmark, Search } from 'lucide-react';

const BlogComponent = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Getting Started with Next.js",
      content: "Next.js is a powerful framework for building React applications...",
      author: {
        name: "Ayush Upadhyay",
        avatar: "https://media.licdn.com/dms/image/v2/D5603AQFgVZrPnKX2yg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1714299394862?e=1740614400&v=beta&t=HE1P9p2YdSKJsubHvqIVmdkGI4bfL1nLu6Qg6ZPvrkI"
      },
      coverImage: "https://media.licdn.com/dms/image/v2/D4E12AQEIqlkU8NSvJg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1692105491054?e=2147483647&v=beta&t=TmE4P7hBwEMLC-PROEmExcWzuVy4S4mAvZulxTqr5d4", 
      category: "Development",
      status: "published",
      likes: 42,
      comments: [],
      isLiked: false,
      isBookmarked: false,
      date: "2024-12-26",
      tags: ["Next.js", "React", "Web Development"],
      readTime: "5 min read",
      views: 1234
    },
  ]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: [],
    category: '',
    status: 'draft',
    coverImage: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'Development', 'Design', 'Marketing', 'Business', 
    'Technology', 'Tutorial', 'News', 'Opinion'
  ];

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file); // Using object URL for preview
      setNewPost(prev => ({ ...prev, coverImage: url }));
    }
  };

  const handleSubmitPost = () => {
    if (newPost.title && newPost.content) {
      const post = {
        id: Date.now(),
        ...newPost,
        author: {
          name: "Current User",
          avatar: "/api/placeholder/50/50"
        },
        likes: 0,
        comments: [],
        isLiked: false,
        isBookmarked: false,
        date: new Date().toISOString().split('T')[0],
        readTime: `${Math.max(1, Math.ceil(newPost.content.split(' ').length / 200))} min read`,
        views: 0,
      };
      setPosts([post, ...posts]);
      setNewPost({
        title: '',
        content: '',
        tags: [],
        category: '',
        status: 'draft',
        coverImage: null
      });
      setShowNewPost(false);
    }
  };

  const filteredPosts = posts
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(post =>
      selectedTags.length === 0 || selectedTags.every(tag => post.tags.includes(tag))
    )
    .filter(post =>
      selectedCategory === 'all' || post.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'mostLiked':
          return b.likes - a.likes;
        case 'mostViewed':
          return b.views - a.views;
        default: // 'newest'
          return new Date(b.date) - new Date(a.date);
      }
    });
  
  return (
    <div className="container mx-auto p-4 pt-16 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 mx-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 pr-4"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setShowNewPost(!showNewPost)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {showNewPost ? 'Cancel' : 'Write New Post'}
          </Button>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="mostLiked">Most Liked</SelectItem>
              <SelectItem value="mostViewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'Web Development'].map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full text-xl font-bold"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={newPost.category}
                onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newPost.status}
                onValueChange={(value) => setNewPost(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Set status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Cover Image</label>
              <div className="flex items-center gap-4">
                {newPost.coverImage && (
                  <img
                    src={newPost.coverImage}
                    alt="Cover"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" className="relative">
                    Upload Cover Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                    />
                  </Button>
                </label>
              </div>
            </div>

            <Textarea
              placeholder="Write your post content..."
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[200px]"
            />

            <Input
              placeholder="Add tags (comma-separated)"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim());
                setNewPost(prev => ({ ...prev, tags }));
              }}
              className="w-full"
            />

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPost}>
                {newPost.status === 'draft' ? 'Save Draft' : 'Publish Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts List */}
      <div className="space-y-6">
        {filteredPosts.map(post => (
          <Card key={post.id} className="overflow-hidden">
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
                    <CardDescription>
                      By {post.author.name} • {post.date} • {post.readTime} • {post.views} views
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.status === 'draft' && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPosts(posts.map(p =>
                      p.id === post.id
                        ? { ...p, isBookmarked: !p.isBookmarked }
                        : p
                    ));
                  }}
                >
                  <Bookmark
                    className={`h-5 w-5 ${post.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none mb-4">
                {post.content}
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                    onClick={() => {
                      setPosts(posts.map(p =>
                        p.id === post.id
                          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
                          : p
                      ));
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{post.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                    onClick={() => setShowComments(prev => ({
                      ...prev,
                      [post.id]: !prev[post.id]
                    }))}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {post.status === 'draft' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewPost({
                          ...post,
                          status: 'draft'
                        });
                        setShowNewPost(true);
                      }}
                    >
                      Edit Draft
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                    onClick={() => {
                      // Handle share functionality
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="w-full space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (newComment.trim()) {
                          setPosts(posts.map(p =>
                            p.id === post.id
                              ? {
                                ...p,
                                comments: [
                                  ...p.comments,
                                  {
                                    id: Date.now(),
                                    text: newComment,
                                    author: "Current User",
                                    date: new Date().toISOString()
                                  }
                                ]
                              }
                              : p
                          ));
                          setNewComment('');
                        }
                      }}
                    >
                      Comment
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {post.comments.map(comment => (
                      <Card key={comment.id} className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="py-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1">{comment.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogComponent;