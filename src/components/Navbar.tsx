import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Create a new handler for logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        isScrolled ? 'py-2 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-4 bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-2xl font-medium tracking-tight">
          Post<span className="text-primary">verse</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={cn(
              "transition-colors hover:text-primary",
              location.pathname === '/' && "text-primary font-medium"
            )}
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link 
              to="/posts" 
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === '/posts' && "text-primary font-medium"
              )}
            >
              Posts
            </Link>
          )}
          <div className="pl-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{user?.username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
        
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-md animate-fadeIn">
          <div className="container py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={cn(
                "transition-colors hover:text-primary py-2 px-4 rounded-md",
                location.pathname === '/' && "bg-primary/10 text-primary font-medium"
              )}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/posts" 
                className={cn(
                  "transition-colors hover:text-primary py-2 px-4 rounded-md",
                  location.pathname === '/posts' && "bg-primary/10 text-primary font-medium"
                )}
              >
                Posts
              </Link>
            )}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-muted-foreground px-4">{user?.username}</span>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
