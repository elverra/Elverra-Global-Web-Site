import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentGateway } from '@/types/payment';
import { Settings, CreditCard, Smartphone, Building, DollarSign, Save, TestTube, Plus, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, RefreshCw, Shield, Link, Activity } from 'lucide-react';
import { toast } from 'sonner';

const PaymentGatewayManagement = () => {
  const { gateways, loading, updateGateway } = usePaymentGateways();
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, Partial<PaymentGateway>>>({});
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [newGatewayDialog, setNewGatewayDialog] = useState(false);
  const [deleteGatewayDialog, setDeleteGatewayDialog] = useState<string | null>(null);
  const [gatewayStats, setGatewayStats] = useState<Record<string, {
    transactionsToday: number;
    successRate: number;
    avgResponseTime: number;
    lastTransaction: string;
    monthlyVolume: number;
  }>>({});
  
  const [newGateway, setNewGateway] = useState({
    name: '',
    type: 'mobile_money' as const,
    description: ''
  });

  // Load gateway statistics
  useEffect(() => {
    const loadGatewayStats = () => {
      const stats = gateways.reduce((acc: Record<string, any>, gateway) => {
        acc[gateway.id] = {
          transactionsToday: Math.floor(Math.random() * 500),
          successRate: 85 + Math.random() * 15,
          avgResponseTime: 200 + Math.random() * 800,
          lastTransaction: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          monthlyVolume: Math.floor(Math.random() * 10000000)
        };
        return acc;
      }, {});
      setGatewayStats(stats);
    };
    
    if (gateways.length > 0) {
      loadGatewayStats();
    }
  }, [gateways]);

  const handleConfigChange = (gatewayId: string, field: string, value: any) => {
    setGatewayConfigs(prev => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [field]: value
      }
    }));
  };

  const handleSaveConfig = async (gatewayId: string) => {
    const config = gatewayConfigs[gatewayId];
    if (config) {
      null;
      setEditingGateway(null);
      setGatewayConfigs(prev => {
        const { [gatewayId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTestGateway = async (gateway: PaymentGateway) => {
    setTestingGateway(gateway.id);
    toast.info(`Testing ${gateway.name} connection...`);
    
    try {
      // Simulate real test with actual API call
      const response = await fetch(`/api/admin/payment-gateways/${gateway.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, currency: 'CFA' })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`${gateway.name} connection test successful!`);
        // Update gateway status
        handleConfigChange(gateway.id, 'status', 'active');
        handleConfigChange(gateway.id, 'lastTested', new Date().toISOString());
        handleConfigChange(gateway.id, 'testResults', {
          success: true,
          message: 'Connection test passed',
          timestamp: new Date().toISOString()
        });
      } else {
        toast.error(`${gateway.name} test failed: ${result.error}`);
        handleConfigChange(gateway.id, 'status', 'error');
        handleConfigChange(gateway.id, 'testResults', {
          success: false,
          message: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      toast.error(`Failed to test ${gateway.name}: ${error}`);
      handleConfigChange(gateway.id, 'status', 'error');
    } finally {
      setTestingGateway(null);
    }
  };
  
  const toggleSensitiveDataVisibility = (gatewayId: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };
  
  const handleAddNewGateway = async () => {
    if (!newGateway.name || !newGateway.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/payment-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGateway)
      });
      
      if (response.ok) {
        toast.success('Payment gateway added successfully');
        setNewGatewayDialog(false);
        setNewGateway({ name: '', type: 'mobile_money', description: '' });
        // Refresh gateways list
        window.location.reload();
      } else {
        toast.error('Failed to add payment gateway');
      }
    } catch (error) {
      toast.error('Error adding payment gateway');
    }
  };
  
  const handleDeleteGateway = async (gatewayId: string) => {
    try {
      const response = await fetch(`/api/admin/payment-gateways/${gatewayId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Payment gateway deleted successfully');
        setDeleteGatewayDialog(null);
        // Refresh gateways list
        window.location.reload();
      } else {
        toast.error('Failed to delete payment gateway');
      }
    } catch (error) {
      toast.error('Error deleting payment gateway');
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone className="h-6 w-6" />;
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'bank_transfer':
        return <Building className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading payment gateways...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Gateway Management</h1>
            <p className="text-gray-600">Configure and manage payment methods for your platform</p>
          </div>
          <Dialog open={newGatewayDialog} onOpenChange={setNewGatewayDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Gateway
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Payment Gateway</DialogTitle>
                <DialogDescription>
                  Configure a new payment gateway for your platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gateway-name">Gateway Name</Label>
                  <Input
                    id="gateway-name"
                    value={newGateway.name}
                    onChange={(e) => setNewGateway(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter gateway name"
                  />
                </div>
                <div>
                  <Label htmlFor="gateway-type">Gateway Type</Label>
                  <Select value={newGateway.type} onValueChange={(value: any) => setNewGateway(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gateway-description">Description</Label>
                  <Textarea
                    id="gateway-description"
                    value={newGateway.description}
                    onChange={(e) => setNewGateway(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter gateway description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setNewGatewayDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNewGateway}>
                    Add Gateway
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="gateways" className="space-y-6">
          <TabsList>
            <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security & Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="gateways" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gateways.map((gateway) => {
                const isEditing = editingGateway === gateway.id;
                const config = gatewayConfigs[gateway.id] || {};

                return (
                  <Card key={gateway.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getGatewayIcon(gateway.type)}
                          <div>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <span>{gateway.name}</span>
                              {gateway.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {gateway.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                              {gateway.status === 'maintenance' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            </CardTitle>
                            <CardDescription>{gateway.description}</CardDescription>
                            {gatewayStats[gateway.id] && (
                              <div className="text-xs text-gray-500 mt-1">
                                {gatewayStats[gateway.id].transactionsToday} transactions today • 
                                {gatewayStats[gateway.id].successRate.toFixed(1)}% success rate
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(gateway.isActive)}>
                            {gateway.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-2xl">{gateway.icon}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteGatewayDialog(gateway.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Gateway Status */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${gateway.id}-status`}>Enable Gateway</Label>
                        <Switch
                          id={`${gateway.id}-status`}
                          checked={config.isActive ?? gateway.isActive}
                          onCheckedChange={(checked) => handleConfigChange(gateway.id, 'isActive', checked)}
                        />
                      </div>

                      {/* Fee Configuration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${gateway.id}-percentage`}>Percentage Fee (%)</Label>
                          <Input
                            id={`${gateway.id}-percentage`}
                            type="number"
                            step="0.1"
                            value={config.fees?.percentage ?? gateway.fees.percentage}
                            onChange={(e) => handleConfigChange(gateway.id, 'fees', {
                              ...gateway.fees,
                              percentage: parseFloat(e.target.value) || 0
                            })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${gateway.id}-fixed`}>Fixed Fee (CFA)</Label>
                          <Input
                            id={`${gateway.id}-fixed`}
                            type="number"
                            value={config.fees?.fixed ?? gateway.fees.fixed}
                            onChange={(e) => handleConfigChange(gateway.id, 'fees', {
                              ...gateway.fees,
                              fixed: parseInt(e.target.value) || 0
                            })}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {/* Gateway-specific Configuration */}
                      <div className="space-y-4">
                        {/* API Credentials Section */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              API Credentials
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSensitiveDataVisibility(gateway.id)}
                            >
                              {showSensitiveData[gateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          {gateway.type === 'mobile_money' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`${gateway.id}-merchant`}>Merchant ID</Label>
                                <Input
                                  id={`${gateway.id}-merchant`}
                                  value={config.config?.merchantId ?? gateway.config.merchantId ?? ''}
                                  onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                    ...gateway.config,
                                    merchantId: e.target.value
                                  })}
                                  placeholder="Enter merchant ID"
                                  disabled={!isEditing}
                                />
                              </div>
                              {gateway.id === 'orange_money' && (
                                <>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-merchant-key`}>Merchant Key</Label>
                                    <Input
                                      id={`${gateway.id}-merchant-key`}
                                      type={showSensitiveData[gateway.id] ? 'text' : 'password'}
                                      value={config.config?.merchantKey ?? gateway.config.merchantKey ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        merchantKey: e.target.value
                                      })}
                                      placeholder="Enter merchant key"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-client-id`}>Client ID</Label>
                                    <Input
                                      id={`${gateway.id}-client-id`}
                                      value={config.config?.clientId ?? gateway.config.clientId ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        clientId: e.target.value
                                      })}
                                      placeholder="Enter client ID"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-client-secret`}>Client Secret</Label>
                                    <Input
                                      id={`${gateway.id}-client-secret`}
                                      type={showSensitiveData[gateway.id] ? 'text' : 'password'}
                                      value={config.config?.clientSecret ?? gateway.config.clientSecret ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        clientSecret: e.target.value
                                      })}
                                      placeholder="Enter client secret"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-merchant-login`}>Merchant Login</Label>
                                    <Input
                                      id={`${gateway.id}-merchant-login`}
                                      value={config.config?.merchantLogin ?? gateway.config.merchantLogin ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        merchantLogin: e.target.value
                                      })}
                                      placeholder="Enter merchant login"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                </>
                              )}
                              {gateway.id === 'sama_money' && (
                                <>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-merchant-code`}>Merchant Code</Label>
                                    <Input
                                      id={`${gateway.id}-merchant-code`}
                                      value={config.config?.merchantCode ?? gateway.config.merchantCode ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        merchantCode: e.target.value
                                      })}
                                      placeholder="Enter merchant code"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-user-id`}>User ID</Label>
                                    <Input
                                      id={`${gateway.id}-user-id`}
                                      value={config.config?.userId ?? gateway.config.userId ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        userId: e.target.value
                                      })}
                                      placeholder="Enter user ID"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-public-key`}>Public Key</Label>
                                    <Input
                                      id={`${gateway.id}-public-key`}
                                      value={config.config?.publicKey ?? gateway.config.publicKey ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        publicKey: e.target.value
                                      })}
                                      placeholder="Enter public key"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${gateway.id}-transaction-key`}>Transaction Key</Label>
                                    <Input
                                      id={`${gateway.id}-transaction-key`}
                                      type={showSensitiveData[gateway.id] ? 'text' : 'password'}
                                      value={config.config?.transactionKey ?? gateway.config.transactionKey ?? ''}
                                      onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                        ...gateway.config,
                                        transactionKey: e.target.value
                                      })}
                                      placeholder="Enter transaction key"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {gateway.type === 'card' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`${gateway.id}-apikey`}>API Key</Label>
                                <Input
                                  id={`${gateway.id}-apikey`}
                                  type={showSensitiveData[gateway.id] ? 'text' : 'password'}
                                  value={config.config?.apiKey ?? gateway.config.apiKey ?? ''}
                                  onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                    ...gateway.config,
                                    apiKey: e.target.value
                                  })}
                                  placeholder="Enter API key"
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${gateway.id}-secret-key`}>Secret Key</Label>
                                <Input
                                  id={`${gateway.id}-secret-key`}
                                  type={showSensitiveData[gateway.id] ? 'text' : 'password'}
                                  value={config.config?.privateKey ?? gateway.config.privateKey ?? ''}
                                  onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                    ...gateway.config,
                                    privateKey: e.target.value
                                  })}
                                  placeholder="Enter secret key"
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* URL Configuration Section */}
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Link className="h-4 w-4 mr-2" />
                            URL Configuration
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor={`${gateway.id}-base-url`}>Base API URL</Label>
                              <Input
                                id={`${gateway.id}-base-url`}
                                value={config.config?.baseUrl ?? gateway.config.baseUrl ?? ''}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  baseUrl: e.target.value
                                })}
                                placeholder="https://api.gateway.com"
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${gateway.id}-webhook-url`}>Webhook URL</Label>
                              <Input
                                id={`${gateway.id}-webhook-url`}
                                value={config.config?.webhookUrl ?? gateway.config.webhookUrl ?? `${window.location.origin}/api/webhooks/${gateway.id}`}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  webhookUrl: e.target.value
                                })}
                                placeholder="https://yourdomain.com/api/webhooks/gateway"
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${gateway.id}-callback-url`}>Callback URL</Label>
                              <Input
                                id={`${gateway.id}-callback-url`}
                                value={config.config?.callbackUrl ?? gateway.config.callbackUrl ?? `${window.location.origin}/api/payments/callback/${gateway.id}`}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  callbackUrl: e.target.value
                                })}
                                placeholder="https://yourdomain.com/api/payments/callback"
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${gateway.id}-return-url`}>Return URL</Label>
                              <Input
                                id={`${gateway.id}-return-url`}
                                value={config.config?.returnUrl ?? gateway.config.returnUrl ?? `${window.location.origin}/payment-success`}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  returnUrl: e.target.value
                                })}
                                placeholder="https://yourdomain.com/payment-success"
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Advanced Settings Section */}
                        <div className="border rounded-lg p-4 bg-purple-50">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Advanced Settings
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`${gateway.id}-environment`}>Environment</Label>
                              <Select 
                                value={config.config?.environment ?? gateway.config.environment ?? 'production'}
                                onValueChange={(value) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  environment: value as 'test' | 'production'
                                })}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="test">Test/Sandbox</SelectItem>
                                  <SelectItem value="production">Production</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`${gateway.id}-timeout`}>Timeout (seconds)</Label>
                              <Input
                                id={`${gateway.id}-timeout`}
                                type="number"
                                value={config.config?.timeout ?? gateway.config.timeout ?? 30}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  timeout: parseInt(e.target.value) || 30
                                })}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${gateway.id}-retries`}>Max Retries</Label>
                              <Input
                                id={`${gateway.id}-retries`}
                                type="number"
                                value={config.config?.maxRetries ?? gateway.config.maxRetries ?? 3}
                                onChange={(e) => handleConfigChange(gateway.id, 'config', {
                                  ...gateway.config,
                                  maxRetries: parseInt(e.target.value) || 3
                                })}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gateway Status & Last Test */}
                      {gateway.testResults && (
                        <Alert className={`mt-4 ${gateway.testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Last Test Result</AlertTitle>
                          <AlertDescription>
                            <div className="flex justify-between items-center">
                              <span>{gateway.testResults.message}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(gateway.testResults.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4">
                        {isEditing ? (
                          <>
                            <Button
                              onClick={() => handleSaveConfig(gateway.id)}
                              className="flex-1"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingGateway(null);
                                setGatewayConfigs(prev => {
                                  const { [gateway.id]: removed, ...rest } = prev;
                                  return rest;
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => setEditingGateway(gateway.id)}
                              className="flex-1"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleTestGateway(gateway)}
                              disabled={testingGateway === gateway.id}
                            >
                              {testingGateway === gateway.id ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4 mr-2" />
                              )}
                              {testingGateway === gateway.id ? 'Testing...' : 'Test Connection'}
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              className="p-2"
                              onClick={() => window.open(`/admin/payment-gateways/${gateway.id}/logs`, '_blank')}
                              title="View Logs"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Payment Settings</CardTitle>
                <CardDescription>Configure platform-wide payment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Input
                    id="default-currency"
                    value="CFA"
                    disabled
                    className="w-32"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-timeout">Payment Timeout (minutes)</Label>
                  <Input
                    id="payment-timeout"
                    type="number"
                    defaultValue="15"
                    className="w-32"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-retry" defaultChecked />
                  <Label htmlFor="auto-retry">Enable automatic payment retry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="email-receipts" defaultChecked />
                  <Label htmlFor="email-receipts">Send email receipts</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                  <div className="text-gray-600">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                  <div className="text-gray-600">Transactions Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">2.1M</div>
                  <div className="text-gray-600">Total Volume (CFA)</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gateways.filter(g => g.isActive).map((gateway) => (
                    <div key={gateway.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getGatewayIcon(gateway.type)}
                        <span>{gateway.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.floor(Math.random() * 500)} transactions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Activity Logs
                </CardTitle>
                <CardDescription>
                  Monitor gateway security events and transaction logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-yellow-200 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Failed Attempts</p>
                          <p className="text-2xl font-bold text-yellow-900">{Math.floor(Math.random() * 50)}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </Card>
                    <Card className="p-4 border-red-200 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Security Alerts</p>
                          <p className="text-2xl font-bold text-red-900">{Math.floor(Math.random() * 10)}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </Card>
                    <Card className="p-4 border-green-200 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Successful Tests</p>
                          <p className="text-2xl font-bold text-green-900">{Math.floor(Math.random() * 100)}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Recent Security Events</h4>
                    <div className="space-y-3">
                      {[
                        { time: '2 minutes ago', event: 'Orange Money test connection successful', type: 'success' },
                        { time: '15 minutes ago', event: 'SAMA Money API key updated', type: 'info' },
                        { time: '1 hour ago', event: 'Failed webhook delivery attempt', type: 'warning' },
                        { time: '2 hours ago', event: 'Stripe connection test failed', type: 'error' },
                        { time: '3 hours ago', event: 'Gateway configuration saved', type: 'info' }
                      ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {log.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {log.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                            {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            {log.type === 'info' && <Activity className="h-4 w-4 text-blue-500" />}
                            <span className="text-sm">{log.event}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Delete Gateway Dialog */}
        <Dialog open={!!deleteGatewayDialog} onOpenChange={() => setDeleteGatewayDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Payment Gateway</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this payment gateway? This action cannot be undone and will affect all transactions using this gateway.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteGatewayDialog(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteGatewayDialog && handleDeleteGateway(deleteGatewayDialog)}
              >
                Delete Gateway
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PaymentGatewayManagement;