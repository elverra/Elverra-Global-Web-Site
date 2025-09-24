import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Globe, Phone, Mail, Star, ExternalLink, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface Merchant {
  id: string;
  name: string;
  sector_id: number;
  discount_percentage: number;
  location?: string;
  location_map_url?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  advantages?: string; // text or URL
  gallery_urls?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  rating?: number;
}

export default function DiscountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [slide, setSlide] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<{ id?: string; rating: number; comment: string } | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [recommendations, setRecommendations] = useState<Merchant[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("discount_merchants")
          .select(
            "id,name,sector_id,discount_percentage,location,location_map_url,contact_phone,contact_email,description,website,logo_url,cover_image_url,advantages,gallery_urls,is_featured,is_active,created_at,rating"
          )
          .eq("id", Number(id))
          .maybeSingle();
        if (error) throw error;
        const normalized: any = {
          ...(data as any),
          gallery_urls: Array.isArray((data as any)?.gallery_urls)
            ? (data as any).gallery_urls
            : ((data as any)?.gallery_urls ? [(data as any).gallery_urls] : []),
        };
        setMerchant(normalized);
        // Build slider images: cover first, then gallery (unique), else logo
        const gallery = normalized.gallery_urls || [];
        const arr: string[] = [];
        if (normalized.cover_image_url) arr.push(normalized.cover_image_url);
        for (const g of gallery) if (g && !arr.includes(g)) arr.push(g);
        if (arr.length === 0 && normalized.logo_url) arr.push(normalized.logo_url);
        setImages(arr);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load merchant", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Load reviews and recommendations
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        // Reviews
        const { data: rv, error: rvErr } = await supabase
          .from('discount_reviews')
          .select('id,merchant_id,user_id,user_name,rating,comment,created_at')
          .eq('merchant_id', id)
          .order('created_at', { ascending: false });
        if (rvErr && rvErr.code !== '42P01') throw rvErr; // table may not exist yet
        setReviews(rv || []);
        if (user) {
          const mine = (rv || []).find((r: any) => r.user_id === user.id);
          if (mine) setMyReview({ id: mine.id, rating: mine.rating, comment: mine.comment });
        }

        // Recommendations (same sector)
        if (merchant?.sector_id) {
          const { data: recs, error: recErr } = await supabase
            .from('discount_merchants')
            .select('id,name,sector_id,discount_percentage,location,description,website,logo_url,cover_image_url,is_featured,is_active,created_at,rating')
            .eq('is_active', true)
            .eq('sector_id', merchant.sector_id)
            .neq('id', Number(id))
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(6);
          if (recErr) throw recErr;
          setRecommendations((recs || []) as any);
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Aux data load failed', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, merchant?.sector_id, user?.id]);

  const openMaps = () => {
    if (!merchant) return;
    const url = merchant.location_map_url || (merchant.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.location)}` : undefined);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="h-64 flex items-center justify-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!merchant) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="text-center text-gray-600">Discount not found.</div>
        </div>
      </Layout>
    );
  }

  const isAdvantagesUrl = merchant.advantages && /^(http|https):\/\//i.test(merchant.advantages);

  const coverSrc = images[slide];

  const nextSlide = () => setSlide((s) => (images.length ? (s + 1) % images.length : s));
  const prevSlide = () => setSlide((s) => (images.length ? (s - 1 + images.length) % images.length : s));

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : undefined;

  const submitReview = async () => {
    if (!user) {
      toast.error('Please log in to post a review.');
      return;
    }
    if (!id || !myReview) return;
    try {
      setSavingReview(true);
      if (myReview.id) {
        const { error } = await supabase
          .from('discount_reviews')
          .update({ rating: myReview.rating, comment: myReview.comment })
          .eq('id', myReview.id)
          .eq('user_id', user.id);
        if (error) throw error;
        setReviews((prev) => prev.map((r) => r.id === myReview.id ? { ...r, rating: myReview.rating, comment: myReview.comment } : r));
        toast.success('Review updated');
      } else {
        const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name || user.email || 'User';
        const payload = {
          merchant_id: id,
          user_id: user.id,
          user_name: displayName,
          rating: myReview.rating,
          comment: myReview.comment,
        };
        const { data, error } = await supabase
          .from('discount_reviews')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        const newItem = { id: data.id, created_at: new Date().toISOString(), ...payload } as any;
        setReviews((prev) => [newItem, ...prev]);
        setMyReview({ id: data.id, rating: payload.rating, comment: payload.comment });
        toast.success('Review published');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    } finally {
      setSavingReview(false);
    }
  };

  const deleteReview = async (rid: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('discount_reviews')
        .delete()
        .eq('id', rid)
        .eq('user_id', user.id);
      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== rid));
      if (myReview?.id === rid) setMyReview({ id: undefined, rating: 5, comment: '' });
      toast.success('Review deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Badge variant={merchant.is_featured ? "default" : "outline"}>
            {merchant.is_featured ? "Featured" : "Discount"}
          </Badge>
        </div>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
            {coverSrc ? (
              <img src={coverSrc} alt={merchant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image available</div>
            )}
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous" onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" aria-label="Next" onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full " style={{ backgroundColor: i === slide ? 'white' : 'rgba(255,255,255,0.5)' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {merchant.logo_url && (
                  <img src={merchant.logo_url} alt="logo" className="h-12 w-12 object-cover rounded" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{merchant.name}</h1>
                  {typeof merchant.rating === "number" && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" /> {merchant.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" /> {merchant.location || "Location not provided"}
              </div>
              <Badge className="bg-green-600 text-white">{merchant.discount_percentage}% OFF</Badge>
              <div className="grid grid-cols-1 gap-2">
                {merchant.website && (
                  <Button size="sm" variant="outline" className="justify-start" asChild>
                    <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Website <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {merchant.contact_phone && (
                  <Button size="sm" variant="outline" className="justify-start" asChild>
                    <a href={`tel:${merchant.contact_phone}`} className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {merchant.contact_phone}
                    </a>
                  </Button>
                )}
                {merchant.contact_email && (
                  <Button size="sm" variant="outline" className="justify-start" asChild>
                    <a href={`mailto:${merchant.contact_email}`} className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {merchant.contact_email}
                    </a>
                  </Button>
                )}
                {(merchant.location_map_url || merchant.location) && (
                  <Button size="sm" className="justify-start" onClick={openMaps}>
                    <MapPin className="h-4 w-4 mr-1" /> Open in Google Maps
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gallery */}
      {Array.isArray(merchant.gallery_urls) && merchant.gallery_urls.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {merchant.gallery_urls.map((url, idx) => (
              <button key={idx} type="button" onClick={() => { const pos = images.findIndex((u) => u === url); if (pos >= 0) setSlide(pos); }} className="aspect-square overflow-hidden rounded bg-gray-100 focus:outline-none">
                <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description & Advantages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-lg">About this discount</h3>
            <p className="text-gray-700 whitespace-pre-line">{merchant.description || "No description provided."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-lg">Advantages</h3>
            {!merchant.advantages && <p className="text-gray-600">No advantages provided.</p>}
            {merchant.advantages && (
              isAdvantagesUrl ? (
                <Button variant="outline" asChild className="w-full justify-center">
                  <a href={merchant.advantages!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    View advantages <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-gray-700 whitespace-pre-line">{merchant.advantages}</p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Embedded Map */}
      {(merchant.location_map_url || merchant.location) && (
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-3">Map</h3>
          <div className="w-full overflow-hidden rounded-lg bg-gray-100 aspect-[16/9]">
            <iframe
              title="map"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(merchant.location || "")}&z=16&output=embed`}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" /> {merchant.location || 'Address not provided'}
            <Button variant="outline" size="sm" className="ml-auto" onClick={openMaps}>
              Open in Google Maps <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-10">
        <h3 className="font-semibold text-lg mb-3">User reviews {avgRating ? `(average ${avgRating.toFixed(1)})` : ''}</h3>
        {user ? (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setMyReview((prev) => ({ id: prev?.id, rating: n, comment: prev?.comment || '' }))} className="text-yellow-500">
                  <Star className="h-5 w-5" fill={ (myReview?.rating || 0) >= n ? 'currentColor' : 'none' } />
                </button>
              ))}
            </div>
            <Textarea placeholder="Your opinion..." value={myReview?.comment || ''} onChange={(e) => setMyReview((prev) => ({ id: prev?.id, rating: prev?.rating || 5, comment: e.target.value }))} />
            <div className="mt-3 flex gap-2">
              <Button onClick={submitReview} disabled={savingReview}>{savingReview ? 'Sending...' : (myReview?.id ? 'Update' : 'Publish')}</Button>
              {myReview?.id && (
                <Button variant="outline" onClick={() => deleteReview(myReview.id!)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-4">Please log in to post a review.</p>
        )}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.user_name || 'User'}</div>
                <div className="flex items-center gap-1 text-yellow-500">{[1,2,3,4,5].map((n) => (<Star key={n} className="h-4 w-4" fill={r.rating >= n ? 'currentColor' : 'none'} />))}</div>
              </div>
              <p className="text-gray-700 mt-1">{r.comment}</p>
              {user?.id === r.user_id && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setMyReview({ id: r.id, rating: r.rating, comment: r.comment })}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteReview(r.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-10">
          <h3 className="font-semibold text-lg mb-3">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden cursor-pointer" onClick={() => navigate(`/discounts/${rec.id}`)}>
                <div className="aspect-video bg-gray-100">
                  <img src={rec.cover_image_url || rec.logo_url || ''} alt={rec.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="font-semibold">{rec.name}</div>
                  <div className="text-sm text-gray-600">{rec.discount_percentage}% OFF</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  </Layout>
);

}
