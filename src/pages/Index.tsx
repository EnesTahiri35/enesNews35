
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Clock, CloudSun, LogIn } from "lucide-react";
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
        {/* Header - Improved mobile layout */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col gap-4">
              {/* Top row - Title and essential controls */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Enes News Portal
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 hidden sm:block">
                    Stay updated with the latest news
                  </p>
                </div>
                
                {/* Mobile-first auth section */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  {user ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden md:inline truncate max-w-32">
                        {user.email}
                      </span>
                      <Button onClick={handleSignOut} variant="outline" size="sm">
                        <span className="hidden sm:inline">Sign Out</span>
                        <span className="sm:hidden">Out</span>
                      </Button>
                      <Link to="/admin">
                        <Button variant="outline" size="sm">
                          <User className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button onClick={() => openAuthModal('signin')} variant="outline" size="sm">
                      <LogIn className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Admin Login</span>
                      <span className="sm:hidden">Login</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Bottom row - Time and weather info */}
              <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="font-mono text-xs md:text-sm">{currentTime}</span>
                </div>
                
                <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/50 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                  <CloudSun className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">{weather}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search Section - Mobile optimized */}
        <section className="bg-white dark:bg-gray-800 py-4 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 md:h-auto text-base md:text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section - Responsive grid */}
        <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

        {/* Footer - Mobile optimized */}
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
