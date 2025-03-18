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
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  
  // Fetch posts with pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts', currentPage, viewMode],
    queryFn: async () => {
      try {
        const data = await postsApi.getAllPosts(currentPage, 6, viewMode === 'my' ? user?._id : undefined);
        return data;
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        throw error;
      }
    },
  });
  
  // Update posts state when data changes
  useEffect(() => {
    if (data) {
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      
      // If we're on a page higher than total pages, go to last available page
      if (currentPage > data.totalPages && data.totalPages > 0) {
        setCurrentPage(data.totalPages);
      }
    }
  }, [data, currentPage]);
  
  // Handle post deletion
  const handleDeletePost = async (id: string) => {
    try {
      await postsApi.deletePost(id);
      
      // Remove the post from current state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      
      // Refetch posts to update pagination
      await refetch();
      
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

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  // Add the filter controls
  const renderFilterControls = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode('all')}
        >
          All Posts
        </Button>
        <Button
          variant={viewMode === 'my' ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode('my')}
        >
          My Posts
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {viewMode === 'my' ? 'My Posts' : 'All Posts'}
            </h1>
            {renderFilterControls()}
          </div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onDelete={handleDeletePost} 
                />
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Posts;
