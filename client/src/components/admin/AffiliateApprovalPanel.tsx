import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';

import { toast } from 'sonner';

interface Agent {
  id: string;
  user_id: string;
  agent_type: string;
  referral_code: string;
  approval_status: string;
  application_notes?: string;
  rejection_reason?: string;
  total_commissions: number;
  created_at: string;
  joinies?: {
    full_name: string;
    email: string;
    phone?: string;
  } | null;
}

interface WithdrawalRequest {
  id: string;
  withdrawal_amount: number;
  withdrawal_method: string;
  account_details: any;
  status: string;
  requested_at: string;
  processing_notes?: string;
  agents?: {
    referral_code: string;
    joinies?: {
      full_name: string;
      email: string;
    } | null;
  } | null;
}

const AffiliateApprovalPanel = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAgents();
    fetchPendingWithdrawals();
  }, []);

  const fetchPendingAgents = async () => {
    try {
      const response = await fetch('/api/agents/pending');
      if (!response.ok) throw new Error('Failed to fetch pending agents');
      const data = await response.json();
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch pending agents');
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await fetch('/api/withdrawals/pending');
      if (!response.ok) throw new Error('Failed to fetch pending withdrawals');
      const data = await response.json();
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const approveAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          is_active: true
        })
      });

      if (!response.ok) throw new Error('Failed to approve agent');
      
      toast.success('Agent approved successfully');
      fetchPendingAgents();
    } catch (error) {
      console.error('Error approving agent:', error);
      toast.error('Failed to approve agent');
    }
  };

  const rejectAgent = async (agentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_status: 'rejected',
          rejection_reason: reason,
          is_active: false
        })
      });

      if (!response.ok) throw new Error('Failed to reject agent');
      
      toast.success('Agent rejected');
      fetchPendingAgents();
      setSelectedAgent(null);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting agent:', error);
      toast.error('Failed to reject agent');
    }
  };

  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const response = await fetch(`/api/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          processed_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to approve withdrawal');
      
      toast.success('Withdrawal approved - Ready for processing');
      fetchPendingWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    }
  };

  const rejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      const response = await fetch(`/api/withdrawals/${withdrawalId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          processing_notes: reason,
          processed_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to reject withdrawal');
      
      toast.success('Withdrawal rejected');
      fetchPendingWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Affiliate Management</h2>
        <div className="flex gap-2">
          <Badge className="bg-yellow-500">{agents.length} Pending Agents</Badge>
          <Badge className="bg-orange-500">{withdrawals.length} Pending Withdrawals</Badge>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agent Approvals</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No pending agent applications</p>
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">
                          {agent.joinies?.full_name || 'Unknown Name'}
                        </h3>
                        {getStatusBadge(agent.approval_status)}
                        <Badge variant="outline" className="text-xs">
                          {agent.agent_type}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {agent.joinies?.email}
                        </div>
                        {agent.joinies?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {agent.joinies.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          Applied: {new Date(agent.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium">Referral Code: {agent.referral_code}</p>
                        {agent.application_notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Notes:</strong> {agent.application_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => approveAgent(agent.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {selectedAgent?.id === agent.id && (
                    <div className="mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Reason for rejection..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectAgent(agent.id, notes)}
                          disabled={!notes.trim()}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAgent(null);
                            setNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          {withdrawals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No pending withdrawal requests</p>
              </CardContent>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">
                          {withdrawal.agents?.joinies?.full_name || 'Unknown Agent'}
                        </h3>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                          Amount: {withdrawal.withdrawal_amount.toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-500" />
                          Method: {withdrawal.withdrawal_method}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          Requested: {new Date(withdrawal.requested_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Code: {withdrawal.agents?.referral_code}
                        </div>
                      </div>

                      {withdrawal.account_details && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium mb-1">Account Details:</p>
                          <pre className="text-xs text-gray-600">
                            {JSON.stringify(withdrawal.account_details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => approveWithdrawal(withdrawal.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) rejectWithdrawal(withdrawal.id, reason);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateApprovalPanel;