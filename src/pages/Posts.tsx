
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/PostCard';
import { postsApi, Post } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Posts = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Fetch posts
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.getAllPosts,
  });
  
  // Update posts state when data changes
  useEffect(() => {
    if (data) {
      setPosts(data);
    }
  }, [data]);
  
  // Handle post deletion
  const handleDeletePost = async (id: string) => {
    try {
      await postsApi.deletePost(id);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Loading skeletons
  const renderSkeletons = () => (
    Array(6).fill(0).map((_, index) => (
      <div key={index} className="flex flex-col h-full">
        <Skeleton className="h-48 w-full rounded-t-md" />
        <div className="p-6 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto p-4 border-t">
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    ))
  );
  
  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-16">
      <h3 className="text-xl font-medium mb-2">No posts yet</h3>
      <p className="text-muted-foreground mb-6">Be the first to create a post!</p>
      {isAuthenticated && (
        <Button asChild>
          <Link to="/create-post">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Posts</h1>
          {isAuthenticated && (
            <Button asChild>
              <Link to="/create-post">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSkeletons()}
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load posts</p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : posts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handleDeletePost} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
