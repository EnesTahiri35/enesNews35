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
  const {
    toast
  } = useToast();
  const {
    user,
    signOut
  } = useAuth();

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
      const {
        data,
        error
      } = await supabase.from('articles').select('*').eq('published', true).order('created_at', {
        ascending: false
      });
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
    const filtered = articles.filter(article => article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.content.toLowerCase().includes(searchTerm.toLowerCase()) || article.category.toLowerCase().includes(searchTerm.toLowerCase()));
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
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enes News Portal</h1>
              <p className="text-gray-600 mt-1">Stay updated with the latest news</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Time Display */}
              <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono">{currentTime}</span>
              </div>
              
              {/* Weather Display */}
              <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                <CloudSun className="w-4 h-4 mr-2" />
                <span>{weather}</span>
              </div>
              
              {user ? <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
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
                </div> : <div className="flex items-center gap-2">
                  <Button onClick={() => openAuthModal('signin')} variant="outline" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal('signup')} size="sm">
                    Sign Up
                  </Button>
                </div>}
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="text" placeholder="Search articles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Latest News</h2>
          <p className="text-gray-600">{filteredArticles.length} articles found</p>
        </div>

        {filteredArticles.length === 0 ? <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img src={article.image || "/placeholder.svg"} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.created_at)}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/article/${article.id}`}>
                    <Button variant="outline" className="w-full">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>)}
          </div>}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-300">
              Contact us: <a href="mailto:EnesTahiri1516@gmail.com" className="text-blue-400 hover:text-blue-300">EnesTahiri1516@gmail.com</a>
            </p>
            <p className="text-gray-500 text-sm mt-2">© 2025 Enes News Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} onModeChange={setAuthMode} />
    </div>;
};
export default Index;