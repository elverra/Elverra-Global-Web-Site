import { supabase } from "server/supabaseStorage";

// ✅ Créer une boutique (1 user = 1 store)
export async function createStore(userId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from("stores")
    .insert([{ owner_id: userId, name, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ Récupérer la boutique d’un user
export async function getUserStore(userId: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// ✅ Ajouter un produit
export async function addProduct(storeId: string, product: any) {
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, store_id: storeId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ Modifier un produit
export async function updateProduct(productId: string, updates: any) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ Supprimer un produit
export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
  return true;
}

// ✅ Lister tous les produits d'une boutique
export async function getProducts(storeId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId);

  if (error) throw error;
  return data;
}
