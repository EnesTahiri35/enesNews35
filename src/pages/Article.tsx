
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
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

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          setArticle(null);
        } else {
          setArticle(data);
        }
      } catch (error) {
        console.error('Error:', error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Enes News Portal`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.excerpt || article.title);
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      
      if (ogTitle) ogTitle.setAttribute('content', article.title);
      if (ogDescription) ogDescription.setAttribute('content', article.excerpt || article.title);
      if (ogImage && article.image) ogImage.setAttribute('content', article.image);
    }

    return () => {
      // Reset title when component unmounts
      document.title = 'Enes News Portal - Latest News and Updates';
    };
  }, [article]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
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

  // SEO structured data for the article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "image": article.image || "/placeholder.svg",
    "articleSection": article.category
  };

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header - Mobile friendly */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to News</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Article Content - Mobile optimized */}
        <main className="container mx-auto px-4 py-6 md:py-8">
          <article className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-8 mb-6 md:mb-8">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4 flex-wrap">
                  <Badge variant="secondary" className="text-xs md:text-sm">
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {formatDate(article.created_at)}
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {article.title}
                </h1>
              </div>

              {/* Article Image - Responsive */}
              <div className="aspect-video overflow-hidden rounded-lg mb-6 md:mb-8">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Article Content - Mobile friendly typography */}
              <div className="prose prose-sm md:prose-lg max-w-none dark:prose-invert">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {article.content}
                </div>
              </div>
            </div>

            {/* Back Button - Mobile friendly */}
            <div className="text-center">
              <Link to="/">
                <Button size="lg" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Articles
                </Button>
              </Link>
            </div>
          </article>
        </main>
      </div>
    </>
  );
};

export default Article;
