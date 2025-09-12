import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface PageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  page?: any;
  onSaved: () => void;
}

const PageEditor = ({ isOpen, onClose, page, onSaved }: PageEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    meta_keywords: "",
    status: "draft",
    page_type: "page",
    featured_image_url: "",
    is_featured: false
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || "",
        slug: page.slug || "",
        content: page.content || "",
        meta_description: page.meta_description || "",
        meta_keywords: page.meta_keywords || "",
        status: page.status || "draft",
        page_type: page.page_type || "page",
        featured_image_url: page.featured_image_url || "",
        is_featured: page.is_featured || false
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        content: "",
        meta_description: "",
        meta_keywords: "",
        status: "draft",
        page_type: "page",
        featured_image_url: "",
        is_featured: false
      });
    }
  }, [page, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: !page ? generateSlug(value) : prev.slug
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const mockUserResult = { data: { user: { id: 'mock-user-id' } } }; // TODO: Replace with API call
      const { data: { user } } = mockUserResult;
      const pageData = {
        ...formData,
        last_modified_by: user?.id,
        publish_date: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (page) {
        const mockResult = { data: null, error: null }; // TODO: Replace with API call
        const { data, error } = mockResult;
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Page updated successfully",
        });
      } else {
        const mockResult = { data: null, error: null }; // TODO: Replace with API call
        const { data, error } = mockResult;
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Page created successfully",
        });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Edit Page" : "Create New Page"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Page title"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="page-url-slug"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="page_type">Page Type</Label>
              <Select value={formData.page_type} onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="news">News Article</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={formData.featured_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="SEO meta description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={formData.meta_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              />
              <Label htmlFor="is_featured">Featured Page</Label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="content">Content *</Label>
          <div className="mt-2">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your page content here..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'indent': '-1'}, { 'indent': '+1' }],
                  [{ 'align': [] }],
                  ['link', 'image', 'video'],
                  ['clean']
                ],
              }}
              formats={[
                'header', 'bold', 'italic', 'underline', 'strike',
                'color', 'background', 'list', 'bullet', 'indent',
                'align', 'link', 'image', 'video'
              ]}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : (page ? "Update" : "Create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageEditor;