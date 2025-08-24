import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lead, LeadsResponse, LeadSource, LeadStatus } from "@/types/lead";

interface LeadGridProps {
  onCreateLead: () => void;
  onEditLead: (lead: Lead) => void;
  refreshTrigger?: number;
}

const statusColors = {
  new: 'bg-status-new text-white',
  contacted: 'bg-status-contacted text-white',
  qualified: 'bg-status-qualified text-white',
  lost: 'bg-status-lost text-white',
  won: 'bg-status-won text-white',
};

const sourceColors = {
  website: 'bg-source-website text-white',
  facebook_ads: 'bg-source-facebook text-white',
  google_ads: 'bg-source-google text-white',
  referral: 'bg-source-referral text-white',
  events: 'bg-source-events text-white',
  other: 'bg-source-other text-white',
};

export const LeadGrid = ({ onCreateLead, onEditLead, refreshTrigger }: LeadGridProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    source: 'all',
    is_qualified: 'all',
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }
      
      if (filters.is_qualified !== 'all') {
        query = query.eq('is_qualified', filters.is_qualified === 'true');
      }

      // Add pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setLeads((data as Lead[]) || []);
      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit),
      }));
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset pagination to first page when filters change
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchLeads();
    }
  }, [filters, refreshTrigger, user?.id]);

  useEffect(() => {
    fetchLeads();
  }, [pagination.page]);

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Lead deleted",
        description: "Lead has been successfully deleted",
      });
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage and track your sales leads</p>
        </div>
        <Button onClick={onCreateLead} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="won">Won</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_qualified} onValueChange={(value) => setFilters(prev => ({ ...prev, is_qualified: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Qualified</SelectItem>
                <SelectItem value="false">Not Qualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Source</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Value</th>
                  <th className="text-left p-4 font-medium">Last Activity</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                          <div className="text-sm text-muted-foreground">{lead.city}, {lead.state}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{lead.email}</td>
                      <td className="p-4 text-sm">{lead.company}</td>
                      <td className="p-4">
                        <Badge className={statusColors[lead.status]}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={sourceColors[lead.source]}>
                          {lead.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-sm">{lead.score}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{formatCurrency(lead.lead_value)}</td>
                      <td className="p-4 text-sm">{formatDate(lead.last_activity_at)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditLead(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteLead(lead.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};