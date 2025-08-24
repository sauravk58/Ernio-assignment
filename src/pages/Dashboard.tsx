import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeadGrid } from "@/components/LeadGrid";
import { LeadForm } from "@/components/LeadForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lead, CreateLeadRequest } from "@/types/lead";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<'grid' | 'create' | 'edit'>('grid');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/login');
    }
  }, [session, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleCreateLead = async (leadData: CreateLeadRequest) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lead created",
        description: "Lead has been successfully created",
      });
      setCurrentView('grid');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (leadData: CreateLeadRequest) => {
    if (!selectedLead || !user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', selectedLead.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lead updated",
        description: "Lead has been successfully updated",
      });
      setCurrentView('grid');
      setSelectedLead(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
      setCurrentView('grid');
      setSelectedLead(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView('edit');
  };

  const handleCancelForm = () => {
    setCurrentView('grid');
    setSelectedLead(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 
                  className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => {
                    setCurrentView('grid');
                    setSelectedLead(null);
                  }}
                  title="Click to return to dashboard"
                >
                  Lead Management System
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentView === 'grid' && 'Manage your sales leads'}
                  {currentView === 'create' && 'Create a new lead'}
                  {currentView === 'edit' && 'Edit lead information'}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          {currentView !== 'grid' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelForm}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              ← Back to Dashboard
            </Button>
          )}
          {currentView === 'grid' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-4"
            >
              <Home className="h-4 w-4" />
              ← Back to Home
            </Button>
          )}
        </div>

        {currentView === 'grid' && (
          <LeadGrid
            onCreateLead={() => setCurrentView('create')}
            onEditLead={handleEditLead}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'create' && (
          <div className="max-w-4xl mx-auto">
            <LeadForm
              onSubmit={handleCreateLead}
              onCancel={handleCancelForm}
              loading={loading}
            />
          </div>
        )}

        {currentView === 'edit' && selectedLead && (
          <div className="max-w-4xl mx-auto">
            <LeadForm
              lead={selectedLead}
              onSubmit={handleUpdateLead}
              onCancel={handleCancelForm}
              loading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;