import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  message: string;
  sender_type: "visitor" | "admin";
  created_at: string;
}

export interface Conversation {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  rating: number | null;
  rating_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useChat = (conversationId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (convId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages((data || []) as ChatMessage[]);
    }
    setLoading(false);
  };

  const sendMessage = async (convId: string, message: string, senderType: "visitor" | "admin") => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{ conversation_id: convId, message, sender_type: senderType }])
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return { error };
    }

    return { data };
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`chat-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  return { messages, loading, sendMessage, fetchMessages };
};

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  const createConversation = async (visitorName?: string, visitorEmail?: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert([{ visitor_name: visitorName, visitor_email: visitorEmail }])
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return { error };
    }

    return { data };
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to new conversations
    const channel = supabase
      .channel("conversations-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { conversations, loading, fetchConversations, createConversation };
};
