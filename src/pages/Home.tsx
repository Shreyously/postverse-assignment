
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-background to-background/90 z-0"></div>
        <div className="container relative z-10 mx-auto px-4 py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 fade-in">
            Share Your <span className="text-primary">Stories</span> With The World
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 fade-in fade-in-delay-1">
            Create, share and discover posts in a beautiful minimalist platform designed for content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 fade-in fade-in-delay-2">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/posts">
                  View Posts
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Postverse?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-lg shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Simple & Intuitive</h3>
              <p className="text-muted-foreground">A clean interface that puts your content first, making it easy to create and share your posts.</p>
            </div>
            
            <div className="bg-background p-8 rounded-lg shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Beautiful Design</h3>
              <p className="text-muted-foreground">Thoughtfully crafted with attention to detail, creating a premium experience for you and your readers.</p>
            </div>
            
            <div className="bg-background p-8 rounded-lg shadow-sm border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Cloud Storage</h3>
              <p className="text-muted-foreground">Your content is securely stored in the cloud, accessible from anywhere and on any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start creating?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join our community of content creators today and share your stories with the world.
          </p>
          <Button size="lg" asChild>
            <Link to={isAuthenticated ? "/posts" : "/signup"}>
              {isAuthenticated ? "View Posts" : "Get Started"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
