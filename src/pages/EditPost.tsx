import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { postsApi, Post } from '@/services/api';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 0 || files.length === 1, 'Select only one image')
    .refine(
      (files) => files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `Max file size is 5MB`
    )
    .refine(
      (files) => files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch post data
  const { data, isLoading: isLoadingPost, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPostById(id!),
    enabled: !!id,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Update form when post data is loaded
  useEffect(() => {
    if (data) {
      setPost(data);
      form.reset({
        title: data.title,
        content: data.content,
      });
      
      if (data.imageUrl) {
        setImagePreview(data.imageUrl);
      }
    }
  }, [data, form]);

  // Handle image preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      
      // Append image if provided
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      
      // Send update post request
      await postsApi.updatePost(id, formData);
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      
      toast({
        title: 'Success',
        description: 'Your post has been updated successfully!',
      });
      
      // Navigate back to the post
      navigate(`/post/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update post. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading skeleton
  if (isLoadingPost) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !post) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container max-w-2xl mx-auto px-4 text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're trying to edit doesn't exist or has been removed.
          </p>
          <Button asChild>
            <a href="/posts">Back to posts</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a title for your post" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your post content here..." 
                          className="min-h-[200px]"
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormDescription className="mb-2">
                        {post.imageUrl 
                          ? "Current image shown below. Upload a new one to replace it." 
                          : "Upload an image for your post (optional)."}
                      </FormDescription>
                      {imagePreview && (
                        <div className="mb-4 rounded-md overflow-hidden border border-border">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-[300px] w-full object-cover"
                          />
                        </div>
                      )}
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isLoading}
                          onChange={(e) => {
                            handleImageChange(e);
                            onChange(e.target.files);
                          }}
                          {...rest}
                        />
                      </FormControl>
                      <FormDescription>
                        Max size: 5MB. Supported formats: JPG, PNG, WebP.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating post...' : 'Update Post'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => navigate(`/post/${id}`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPost;
