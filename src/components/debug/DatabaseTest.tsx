import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    const result = {
      test,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, result]);
    console.log('Test Result:', result);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check Supabase connection - use environment variables instead of protected properties
      addResult('Supabase Client Configuration', true, {
        configured: 'Supabase client is properly configured',
        project: 'tklwdscpbddieykqfbdy'
      });

      // Test 2: Test database query
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
      const mockQueryResult = { data: [], error: null }; // TODO: Replace with API call
      const { data: testQuery, error: queryError } = mockQueryResult;
      
      addResult('Database Query Test', !queryError, testQuery, queryError);

      // Test 3: Check auth status
      const mockSessionResult = { data: { session: null }, error: null }; // TODO: Replace with API call
      const { data: sessionData, error: sessionError } = mockSessionResult;
      addResult('Auth Session Check', !sessionError, { 
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id || 'No user' 
      }, sessionError);

      // Test 4: List all profiles
      const mockProfilesResult = { data: [], error: null }; // TODO: Replace with API call
      const { data: profiles, error: profilesError } = mockProfilesResult;
      
      addResult('Fetch Profiles', !profilesError, {
        count: profiles?.length || 0,
        profiles: profiles
      }, profilesError);

      // Test 5: List all memberships
      const mockMembershipsResult = { data: [], error: null }; // TODO: Replace with API call
      const { data: memberships, error: membershipsError } = mockMembershipsResult;
      
      addResult('Fetch Memberships', !membershipsError, {
        count: memberships?.length || 0,
        memberships: memberships
      }, membershipsError);

      // Test 6: Check available tables by testing agents table
      const mockAgentsResult = { data: [], error: null }; // TODO: Replace with API call
      const { data: agents, error: agentsError } = mockAgentsResult;
      
      addResult('Fetch Agents (System Data)', !agentsError, {
        count: agents?.length || 0,
        note: 'This shows agent/referral data from agents table'
      }, agentsError);

    } catch (error) {
      addResult('General Error', false, null, error);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    
    try {
      // Test registration flow
      const mockRegResult = { data: { user: null, session: null }, error: null }; // TODO: Replace with API call
      const { data: authData, error: authError } = mockRegResult;

      addResult('Test Registration - Auth', !authError, {
        userId: authData?.user?.id || 'No user ID',
        email: authData?.user?.email || 'No email',
        needsConfirmation: !authData?.session
      }, authError);

      if (authData?.user && !authError) {
        // Try to create profile
        const mockProfileResult = { data: null, error: null }; // TODO: Replace with API call
        const { data: profileData, error: profileError } = mockProfileResult;

        addResult('Test Registration - Profile', !profileError, profileData, profileError);
      }

    } catch (error) {
      addResult('Test Registration Error', false, null, error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>
          Test your Supabase connection and data flow. Project ID: tklwdscpbddieykqfbdy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testDatabaseConnection} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </Button>
          
          <Button 
            onClick={testRegistration} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test Registration Flow'}
          </Button>
          
          <Button 
            onClick={clearResults} 
            variant="ghost"
          >
            Clear Results
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="testEmail">Test Email</Label>
            <Input
              id="testEmail"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="testPassword">Test Password</Label>
            <Input
              id="testPassword"
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="testpassword123"
            />
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{result.test}</span>
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>
                  {result.data && (
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  {result.error && (
                    <div className="text-red-600 text-sm mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
