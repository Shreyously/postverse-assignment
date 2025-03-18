import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { postsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 0 || files.length === 1, 'Image is required')
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

const CreatePost = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Handle image preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
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
      
      // Send create post request
      const newPost = await postsApi.createPost(formData);
      
      // Invalidate and refetch posts query
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast({
        title: 'Success',
        description: 'Your post has been created successfully!',
      });
      
      // Navigate to the new post
      navigate(`/post/${newPost._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a New Post</CardTitle>
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
                      <FormControl>
                        <div className="space-y-2">
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
                          {imagePreview && (
                            <div className="mt-2 rounded-md overflow-hidden border border-border">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-h-[300px] w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an image for your post (optional). Max size: 5MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating post...' : 'Create Post'}
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

export default CreatePost;
