import Layout from '@/components/layout/Layout';
import DatabaseTest from '@/components/debug/DatabaseTest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

const Debug = () => {
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);

  const testAdminLogin = async () => {
    setChecking(true);
    try {
      // First try to sign in to see if user exists
      // TODO: Replace with API call to server - admin login test
      const mockLoginTest = () => {
        return { data: null, error: { message: 'Admin login test disabled during migration' } };
      };
      const { data, error } = mockLoginTest();

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Admin user does not exist. Click "Create Admin User" to create it.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.warning('Admin user exists but email is not confirmed. This is normal for manually created users.');
          // Try to update the user to confirmed status
          await confirmAdminUser();
        } else {
          toast.error(`Login test failed: ${error.message}`);
        }
      } else if (data.user) {
        toast.success('Admin user exists and can login successfully!');
        // Sign out immediately after test
        // TODO: Replace with API call to server - sign out functionality
      }
    } catch (error) {
      console.error('Error testing admin login:', error);
      toast.error('Error testing admin login');
    } finally {
      setChecking(false);
    }
  };

  const confirmAdminUser = async () => {
    try {
      // This is a workaround - create a new user with email confirmation disabled
      toast.info('Attempting to create confirmed admin user...');
      await createAdminUser();
    } catch (error) {
      console.error('Error confirming admin user:', error);
    }
  };

  const createAdminUser = async () => {
    setCreating(true);
    try {
      // TODO: Replace with API call to server - create admin user
      const mockSignUp = () => {
        return { 
          data: { user: { id: 'admin-user-id', email: 'admin@elverraglobal.com' } }, 
          error: null 
        };
      };
      const { data: authData, error: authError } = mockSignUp();

      if (authError) {
        if (authError.message.includes('rate_limit')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (authError.message.includes('already_registered')) {
          toast.info('Admin user already exists. Try the login test.');
        } else {
          toast.error(`Failed to create admin user: ${authError.message}`);
        }
        return;
      }

      if (authData.user) {
        toast.success('Admin user created successfully! You can now try logging in.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error(`Failed to create admin user: ${error}`);
    } finally {
      setCreating(false);
    }
  };

  const createUserRolesTable = async () => {
    setCreating(true);
    try {
      // This is a placeholder - in a real scenario, you'd run the migration
      toast.info('Database migrations need to be applied. The user_roles table is missing.');
      toast.info('In a production environment, run: supabase db push');
    } catch (error) {
      console.error('Error with database setup:', error);
      toast.error('Database setup error');
    } finally {
      setCreating(false);
    }
  };

  const checkDatabaseTables = async () => {
    setChecking(true);
    try {
      // Test if user_roles table exists
      const response = await fetch('/api/admin/check-tables');
      
      if (response.ok) {
        toast.success('Database tables exist and are accessible!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          toast.error('Required database tables are missing. Database migrations need to be applied.');
        } else {
          toast.error(`Database error: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error checking database:', error);
      toast.error('Error checking database tables');
    } finally {
      setChecking(false);
    }
  };

  const manualAdminSetup = async () => {
    setCreating(true);
    try {
      toast.info('Manual Admin Setup Instructions:');
      toast.info('1. Go to your Supabase Dashboard');
      toast.info('2. Navigate to Authentication > Users');
      toast.info('3. Create user: admin@elverraglobal.com');
      toast.info('4. Set password: Admin123!');
      toast.info('5. Confirm the email manually');
      toast.success('Then you can login with these credentials');
    } catch (error) {
      console.error('Error in manual setup:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Database Debug Page</h1>
            
            {/* Admin User Creation */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Admin User Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Set up the admin user account: admin@elverraglobal.com / Admin123!
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={testAdminLogin} 
                      disabled={checking || creating}
                      className="w-full"
                    >
                      {checking ? 'Testing Login...' : 'Test Admin Login'}
                    </Button>
                    <Button 
                      onClick={createAdminUser} 
                      disabled={creating || checking}
                      variant="outline"
                      className="w-full"
                    >
                      {creating ? 'Creating Admin User...' : 'Create Admin User'}
                    </Button>
                    <Button 
                      onClick={checkDatabaseTables} 
                      disabled={creating || checking}
                      variant="outline"
                      className="w-full"
                    >
                      {checking ? 'Checking Database...' : 'Check Database Tables'}
                    </Button>
                    <Button 
                      onClick={createUserRolesTable} 
                      disabled={creating || checking}
                      variant="outline"
                      className="w-full"
                    >
                      {creating ? 'Setting up Database...' : 'Setup Database (Info Only)'}
                    </Button>
                    <Button 
                      onClick={manualAdminSetup} 
                      disabled={creating || checking}
                      variant="secondary"
                      className="w-full"
                    >
                      Show Manual Setup Instructions
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Try "Test Admin Login" first to check if admin user exists</p>
                    <p>• Use "Create Admin User" if the test fails</p>
                    <p>• Check "Database Tables" to see if migrations are applied</p>
                    <p>• Login credentials: admin@elverraglobal.com / Admin123!</p>
                    <p>• If all fails, use "Manual Setup Instructions"</p>
                    <p className="text-orange-600">• Note: Database migrations may need to be applied for full functionality</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <DatabaseTest />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Debug;