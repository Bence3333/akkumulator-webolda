import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useCallbackRequests = () => {
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCallbackRequests = async () => {
    const { data, error } = await supabase
      .from("callback_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching callback requests:", error);
    } else {
      setCallbackRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCallbackRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("callback_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "callback_requests",
        },
        () => {
          fetchCallbackRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleCompleted = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("callback_requests")
      .update({ completed })
      .eq("id", id);
    
    if (error) {
      console.error("Error updating callback request:", error);
      return { error };
    }
    
    setCallbackRequests(prev => prev.map(c => c.id === id ? { ...c, completed } : c));
    return { success: true };
  };

  const deleteCallbackRequest = async (id: string) => {
    const { error } = await supabase
      .from("callback_requests")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting callback request:", error);
      return { error };
    }
    
    setCallbackRequests(prev => prev.filter(c => c.id !== id));
    return { success: true };
  };

  const createCallbackRequest = async (data: { name: string; phone: string; email?: string; message?: string }) => {
    const { error } = await supabase
      .from("callback_requests")
      .insert([data]);
    
    if (error) {
      console.error("Error creating callback request:", error);
      return { error };
    }
    
    return { success: true };
  };

  return {
    callbackRequests,
    loading,
    fetchCallbackRequests,
    toggleCompleted,
    deleteCallbackRequest,
    createCallbackRequest,
  };
};