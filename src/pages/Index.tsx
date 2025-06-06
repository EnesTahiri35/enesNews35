
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Clock, CloudSun, LogIn, Menu, X, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
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

  // SEO structured data for articles
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredArticles.map((article, index) => ({
      "@type": "NewsArticle",
      "position": index + 1,
      "headline": article.title,
      "description": article.excerpt,
      "datePublished": article.created_at,
      "author": {
        "@type": "Organization",
        "name": "Enes News Portal"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Enes News Portal"
      },
      "url": `${window.location.origin}/article/${article.id}`,
      "image": article.image || "/placeholder.svg"
    }))
  };

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Top Ad Banner */}
        <div className="bg-gray-100 dark:bg-gray-800 py-2 text-center border-b">
          <div className="container mx-auto px-4">
            <div className="h-20 bg-white dark:bg-gray-700 rounded flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Advertisement Space</span>
            </div>
          </div>
        </div>

        {/* Navigation Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            {/* Main Navigation Bar */}
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Enes News Portal
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-mono">{currentTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CloudSun className="w-4 h-4 mr-2" />
                    <span>{weather}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">
                        {user.email}
                      </span>
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
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-mono">{currentTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CloudSun className="w-4 h-4 mr-2" />
                      <span>{weather}</span>
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {user.email}
                      </span>
                      <div className="flex space-x-2">
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
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button onClick={() => openAuthModal('signin')} variant="outline" size="sm">
                        <LogIn className="w-4 h-4 mr-2" />
                        Admin Login
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subtitle */}
            <div className="pb-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Stay updated with the latest news and breaking stories
              </p>
            </div>
          </div>
        </header>

        {/* Search Section */}
        <section className="bg-white dark:bg-gray-800 py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Ad Space */}
        <div className="container mx-auto px-4 py-6 flex-1">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar Ad */}
            <aside className="lg:w-64 order-1 lg:order-1">
              <div className="sticky top-24">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <span className="text-gray-500 dark:text-gray-400 text-sm text-center">
                      Sidebar Ad<br />Space
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 order-2">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Latest News
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                  {filteredArticles.length} articles found
                </p>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
                    No articles found matching your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                      <div className="aspect-video overflow-hidden rounded-t-lg flex-shrink-0">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <CardHeader className="flex-1">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {article.category}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span className="truncate">{formatDate(article.created_at)}</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 dark:text-white text-base md:text-lg leading-tight">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 dark:text-gray-300 text-sm flex-1">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Link to={`/article/${article.id}`}>
                          <Button variant="outline" className="w-full" size="sm">
                            Read More
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>

            {/* Right Sidebar Ad */}
            <aside className="lg:w-64 order-3">
              <div className="sticky top-24">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <span className="text-gray-500 dark:text-gray-400 text-sm text-center">
                      Sidebar Ad<br />Space
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-6 md:py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm md:text-base">
                Contact us:{" "}
                <a 
                  href="mailto:EnesTahiri1516@gmail.com" 
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  EnesTahiri1516@gmail.com
                </a>
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">
                © 2025 Enes News Portal. All rights reserved.
              </p>
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
    </>
  );
};

export default Index;
