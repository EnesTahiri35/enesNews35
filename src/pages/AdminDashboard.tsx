import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, LogOut, Calendar, ImagePlus, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  created_at: string;
  excerpt: string;
  author_id: string;
  published: boolean;
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate("/admin");
      return;
    }

    // Load articles from Supabase
    fetchArticles();
  }, [user, navigate]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive",
        });
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    }
  };

  const ensureBucketExists = async () => {
    try {
      // First, try to list buckets to see if 'images' exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
      
      if (!imagesBucket) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('images', {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
        
        console.log('Created images bucket successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Ensure bucket exists
      const bucketExists = await ensureBucketExists();
      if (!bucketExists) {
        throw new Error('Failed to create or access storage bucket');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `content-images/${fileName}`;

      console.log('Uploading file:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;
      console.log('Image uploaded successfully:', imageUrl);
      
      // Insert image markdown at cursor position
      const textarea = contentTextareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBefore = newArticle.content.substring(0, cursorPosition);
        const textAfter = newArticle.content.substring(cursorPosition);
        const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`;
        
        const newContent = textBefore + imageMarkdown + textAfter;
        setNewArticle({...newArticle, content: newContent});
        
        // Set cursor position after the inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            cursorPosition + imageMarkdown.length,
            cursorPosition + imageMarkdown.length
          );
        }, 0);
      }

      toast({
        title: "Success",
        description: "Image uploaded and inserted into content",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/admin");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create articles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            title: newArticle.title,
            content: newArticle.content,
            category: newArticle.category,
            image: newArticle.image,
            excerpt: newArticle.content.substring(0, 150) + "...",
            author_id: user.id,
            published: true
          }
        ])
        .select();

      if (error) {
        console.error('Error creating article:', error);
        toast({
          title: "Error",
          description: "Failed to create article. Please try again.",
          variant: "destructive",
        });
        return;
      }

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
      
      // Refresh articles list
      fetchArticles();
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        toast({
          title: "Error",
          description: "Failed to delete article. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Article deleted",
        description: "The article has been removed successfully.",
      });

      // Refresh articles list
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    }
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content *</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ImagePlus className="w-4 h-4 mr-2" />
                        )}
                        {isUploadingImage ? "Uploading..." : "Add Image"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    ref={contentTextareaRef}
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Write your article content here... You can add images using the 'Add Image' button above."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Click where you want to insert an image in the content, then use the "Add Image" button.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Featured Image URL</Label>
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
                          {formatDate(article.created_at)}
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
