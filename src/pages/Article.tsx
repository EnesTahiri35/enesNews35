
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string;
  date: string;
  excerpt: string;
}

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const savedArticles = localStorage.getItem("newsArticles");
    if (savedArticles) {
      const articles: Article[] = JSON.parse(savedArticles);
      const foundArticle = articles.find(a => a.id === parseInt(id || "0"));
      setArticle(foundArticle || null);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{article.category}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(article.date)}
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Article Image */}
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>

          {/* Related Articles or Back Button */}
          <div className="text-center">
            <Link to="/">
              <Button size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Articles
              </Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Article;
