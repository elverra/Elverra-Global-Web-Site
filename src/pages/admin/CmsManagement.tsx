import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageEditor from "@/components/cms/PageEditor";
import Layout from "@/components/layout/Layout";

const CmsManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    views: 0
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/pages');
      
      if (!response.ok) {
        if (response.status === 404) {
          setPages([]);
          setStats({ total: 0, published: 0, drafts: 0, views: 0 });
          return;
        }
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();

      setPages(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const published = data?.filter((p: any) => p.status === 'published').length || 0;
      const drafts = data?.filter((p: any) => p.status === 'draft').length || 0;
      const views = data?.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0) || 0;
      
      setStats({ total, published, drafts, views });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`/api/cms/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (page: any) => {
    setSelectedPage(page);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedPage(null);
    setIsEditorOpen(true);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "news":
        return "📰";
      case "blog":
        return "📝";
      default:
        return "📄";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CMS Management</h1>
            <p className="text-muted-foreground">Manage website content and pages</p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All content</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
              <p className="text-xs text-muted-foreground">Live content</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Content Pages</CardTitle>
            <CardDescription>Manage your website pages and content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Pages Table */}
            {loading ? (
              <div className="text-center py-8">Loading pages...</div>
            ) : (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(page.page_type)}</span>
                        <h3 className="font-semibold">{page.title}</h3>
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                        {page.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{page.slug} • {page.page_type} • {page.view_count || 0} views
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last modified: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(page)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDelete(page.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredPages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No pages found matching your search." : "No pages found."}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <PageEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          page={selectedPage}
          onSaved={fetchPages}
        />
      </div>
    </Layout>
  );
};

export default CmsManagement;