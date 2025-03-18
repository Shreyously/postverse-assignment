
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, User, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { postsApi, Post } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch post data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPostById(id!),
    enabled: !!id,
  });

  // Update post state when data changes
  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data]);

  // Check if the current user is the author
  const isAuthor = post && user && (
    typeof post.author === 'object' 
      ? post.author._id === user._id
      : post.author === user._id
  );

  // Format the date
  const formattedDate = post 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) 
    : '';

  // Get author name
  const authorName = post 
    ? typeof post.author === 'object'
      ? post.author.username
      : 'Unknown'
    : '';

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!id) return;
    
    try {
      await postsApi.deletePost(id);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      navigate('/posts');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <Link to="/posts" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to posts
            </Link>
          </div>
          
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
          
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !post) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container max-w-3xl mx-auto px-4 text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/posts">Back to posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/posts" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8 gap-y-2">
          <div className="flex items-center mr-6">
            <User size={14} className="mr-2" />
            <span>{authorName}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-2" />
            <span>{formattedDate}</span>
          </div>
          
          {isAuthor && (
            <div className="ml-auto flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/edit-post/${post._id}`}>
                  <Edit size={14} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
        
        {post.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostDetail;
