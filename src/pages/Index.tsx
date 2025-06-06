
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Clock, CloudSun, LogIn, Menu, X, Facebook, Twitter, Instagram, Linkedin, Youtube, Play, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  created_at: string;
  excerpt: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [weather, setWeather] = useState("22°C Sunny");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive"
        });
        return;
      }

      setArticles(data || []);
      setFilteredArticles(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const getRandomViewCount = () => {
    return Math.floor(Math.random() * 1000000) + 1000;
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const socialMediaLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground fill-current" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">
                  Lovable
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-12 h-10 w-full rounded-full border-2 border-border focus:border-primary"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 rounded-full p-0"
                  variant="ghost"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Social Media Icons */}
              <div className="hidden lg:flex items-center space-x-3">
                {socialMediaLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>

              <ThemeToggle />

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button onClick={() => openAuthModal('signin')} variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              )}

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-12 h-10 w-full rounded-full"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 rounded-full p-0"
                  variant="ghost"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Mobile Social Icons */}
              <div className="flex justify-center space-x-4 mt-4">
                {socialMediaLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Latest Videos
          </h2>
          <p className="text-muted-foreground">
            {filteredArticles.length} videos found
          </p>
        </div>

        {/* Video Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No videos found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="group cursor-pointer">
                <Link to={`/article/${article.id}`}>
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white fill-current" />
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(Math.random() * 20 + 5)}:00
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{formatViewCount(getRandomViewCount())}</span>
                      <span>•</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-6">
              {socialMediaLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-background shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
            
            {/* Contact Info */}
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Contact us:{" "}
                <a 
                  href="mailto:EnesTahiri1516@gmail.com" 
                  className="text-primary hover:underline"
                >
                  EnesTahiri1516@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground/80 text-sm">
                © 2025 Lovable Video Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
