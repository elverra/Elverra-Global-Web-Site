import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, UserPlus, X } from 'lucide-react';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SUPPORT' | 'PARTNER' | 'USER';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  password: string;
  updated_at?: string;
  is_admin: boolean;
  profile_image_url: string;
  identity_card_image_url: string;
  physical_card_status: string;
  address: string;
  affiliate_balance: number;
  role: UserRole;
}

interface NewUserForm {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: '',
    password: '',
    full_name: '',
    role: 'USER',
  });

  // Récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles) return;
  
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
  
      const rolesMap = new Map();
      userRoles?.forEach(role => {
        rolesMap.set(role.user_id, role.role);
      });
  
      const formattedUsers = profiles.map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'USER',
        is_admin: profile.is_admin || false,
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        profile_image_url: profile.profile_image_url || '',
        identity_card_image_url: profile.identity_card_image_url || '',
        physical_card_status: profile.physical_card_status || 'none',
        address: profile.address || '',
        affiliate_balance: parseFloat(profile.affiliate_balance) || 0
      }));
  
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
  
      if (existingRole) {
        await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_roles')
          .insert([{ 
            user_id: userId, 
            role: newRole,
            permissions: {}
          }]);
      }
  
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
  
      toast.success('Rôle utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle :', error);
      toast.error('Échec de la mise à jour du rôle utilisateur');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      setUsers(users.filter(user => user.id !== userId));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      toast.error('Échec de la suppression de l\'utilisateur');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: { full_name: newUser.full_name },
        },
      });
  
      if (signUpError) throw signUpError;
  
      if (authData.user) {
        await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: newUser.email,
            full_name: newUser.full_name,
            is_active: true
          }]);
        
        await updateUserRole(authData.user.id, newUser.role);
        
        setNewUser({
          email: '',
          password: '',
          full_name: '',
          role: 'USER',
        });
        
        setShowAddUser(false);
        await fetchUsers();
        toast.success('Utilisateur créé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      toast.error(`Échec de la création de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user?.full_name?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const role = user?.role?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'SUPPORT':
        return 'bg-green-100 text-green-800';
      case 'PARTNER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les utilisateurs et leurs rôles</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="w-full">
        <Input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Table className="w-full">
  <TableHeader>
    <TableRow className="h-10">
      <TableHead className="p-2 w-[30%]">Nom</TableHead>
      <TableHead className="p-2 w-[20%]">Rôle</TableHead>
      <TableHead className="p-2 w-[30%]">Date d'inscription</TableHead>
      <TableHead className="p-2 w-[20%] text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {loading ? (
      <TableRow>
        <TableCell colSpan={4} className="p-2 text-center">
          Chargement...
        </TableCell>
      </TableRow>
    ) : filteredUsers.length === 0 ? (
      <TableRow>
        <TableCell colSpan={4} className="p-2 text-center">
          Aucun utilisateur trouvé
        </TableCell>
      </TableRow>
    ) : (
      filteredUsers.map((user) => (
        <TableRow key={user.id} className="h-12 hover:bg-muted/50">
          <TableCell className="p-2">
            <div className="font-medium">{user.full_name || 'Non renseigné'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </TableCell>
          <TableCell className="p-2">
            <Badge className={getRoleBadgeColor(user.role)}>
              {user.role}
            </Badge>
          </TableCell>
          <TableCell className="p-2">
            {new Date(user.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </TableCell>
          <TableCell className="p-2">
            <div className="flex justify-end items-center space-x-2">
              <Select
                value={user.role}
                onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="PARTNER">Partenaire</SelectItem>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => deleteUser(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
        </CardContent>
      </Card>

      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter un utilisateur</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAddUser(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div>
                <Label>Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) => 
                    setNewUser({...newUser, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="PARTNER">Partenaire</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddUser(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddUser}
                  disabled={!newUser.email || !newUser.password || !newUser.full_name}
                >
                  Créer l'utilisateur
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;