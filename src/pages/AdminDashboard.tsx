
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, LogOut, Edit, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string;
  date: string;
  excerpt: string;
}

const AdminDashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "",
    image: "/placeholder.svg"
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin");
      return;
    }

    // Load articles
    const savedArticles = localStorage.getItem("newsArticles");
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/admin");
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const article: Article = {
      id: Date.now(),
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category,
      image: newArticle.image,
      date: new Date().toISOString().split('T')[0],
      excerpt: newArticle.content.substring(0, 150) + "..."
    };

    const updatedArticles = [article, ...articles];
    setArticles(updatedArticles);
    localStorage.setItem("newsArticles", JSON.stringify(updatedArticles));

    toast({
      title: "Article added",
      description: "The article has been published successfully.",
    });

    setNewArticle({
      title: "",
      content: "",
      category: "",
      image: "/placeholder.svg"
    });
    setIsAddingArticle(false);
  };

  const handleDeleteArticle = (id: number) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    localStorage.setItem("newsArticles", JSON.stringify(updatedArticles));

    toast({
      title: "Article deleted",
      description: "The article has been removed successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your news articles</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Add Article Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Add New Article</CardTitle>
                <CardDescription>Create and publish a new news article</CardDescription>
              </div>
              <Button onClick={() => setIsAddingArticle(!isAddingArticle)}>
                <Plus className="w-4 h-4 mr-2" />
                {isAddingArticle ? "Cancel" : "Add Article"}
              </Button>
            </div>
          </CardHeader>
          
          {isAddingArticle && (
            <CardContent>
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      placeholder="Enter article title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      placeholder="e.g., Technology, Sports, Politics"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Write your article content here..."
                    rows={8}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={newArticle.image}
                    onChange={(e) => setNewArticle({...newArticle, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Publish Article
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>All Articles ({articles.length})</CardTitle>
            <CardDescription>Manage your published articles</CardDescription>
          </CardHeader>
          <CardContent>
            {articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No articles published yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(article.date)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteArticle(article.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
