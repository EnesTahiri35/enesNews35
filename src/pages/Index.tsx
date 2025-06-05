
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Clock, CloudSun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string;
  date: string;
  excerpt: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [weather, setWeather] = useState("22°C Sunny");
  const { toast } = useToast();

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
    // Load articles from localStorage or use mock data
    const savedArticles = localStorage.getItem("newsArticles");
    if (savedArticles) {
      const parsedArticles = JSON.parse(savedArticles);
      setArticles(parsedArticles);
      setFilteredArticles(parsedArticles);
    } else {
      // Mock initial data
      const mockArticles: Article[] = [
        {
          id: 1,
          title: "Breaking: Technology Revolution Continues",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          category: "Technology",
          image: "/placeholder.svg",
          date: new Date().toISOString().split('T')[0],
          excerpt: "Technology continues to evolve at an unprecedented pace..."
        },
        {
          id: 2,
          title: "Global Climate Summit Reaches New Agreements",
          content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          category: "Environment",
          image: "/placeholder.svg",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          excerpt: "World leaders unite on climate action initiatives..."
        }
      ];
      setArticles(mockArticles);
      setFilteredArticles(mockArticles);
      localStorage.setItem("newsArticles", JSON.stringify(mockArticles));
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">News Portal</h1>
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
              
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
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
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.date)}
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
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-300">
              Contact us: <a href="mailto:EnesTahiri1516@gmail.com" className="text-blue-400 hover:text-blue-300">EnesTahiri1516@gmail.com</a>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              © 2024 News Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
