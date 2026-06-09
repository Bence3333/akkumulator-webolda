import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, ChevronLeft, XCircle, Star, Trash2, Search, RotateCcw, Phone, Mail, MapPin, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations, useChat, Conversation } from "@/hooks/useChat";
import { useCallbackRequests, CallbackRequest } from "@/hooks/useCallbackRequests";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
interface AdminChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminChatPanel = ({ isOpen, onClose }: AdminChatPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"chats" | "callbacks" | "questions">("chats");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [callbackSearchQuery, setCallbackSearchQuery] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { conversations, loading: conversationsLoading, fetchConversations } = useConversations();
  const { messages, sendMessage, loading: messagesLoading } = useChat(
    selectedConversation?.id
  );
  const { callbackRequests, loading: callbacksLoading, toggleCompleted, deleteCallbackRequest, fetchCallbackRequests } = useCallbackRequests();

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    return (
      (conv.visitor_name?.toLowerCase().includes(query) || false) ||
      (conv.visitor_email?.toLowerCase().includes(query) || false)
    );
  });

  // Filter callback requests based on search query - only those with actual phone numbers
  const filteredCallbacks = callbackRequests.filter((callback) => {
    if (callback.phone === "N/A") return false; // Skip questions
    const query = callbackSearchQuery.toLowerCase();
    return (
      callback.name.toLowerCase().includes(query) ||
      (callback.email?.toLowerCase().includes(query) || false) ||
      callback.phone.toLowerCase().includes(query)
    );
  });

  // Filter questions (callback requests with "N/A" phone - from GYIK page)
  const filteredQuestions = callbackRequests.filter((callback) => {
    if (callback.phone !== "N/A") return false; // Skip actual callbacks
    const query = callbackSearchQuery.toLowerCase();
    return (
      callback.name.toLowerCase().includes(query) ||
      (callback.email?.toLowerCase().includes(query) || false) ||
      (callback.message?.toLowerCase().includes(query) || false)
    );
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const messageToSend = message;
    setMessage("");
    
    await sendMessage(selectedConversation.id, messageToSend, "admin");

    // Send notification to visitor if they provided email
    if (selectedConversation.visitor_email) {
      try {
        await supabase.functions.invoke("send-chat-notification", {
          body: {
            type: "admin_reply",
            visitorName: selectedConversation.visitor_name,
            visitorEmail: selectedConversation.visitor_email,
            message: messageToSend,
            conversationId: selectedConversation.id,
          },
        });
      } catch (error) {
        console.error("Error sending visitor notification:", error);
      }
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    
    setShowCloseConfirm(false);
    
    await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", selectedConversation.id);

    setSelectedConversation(null);
    fetchConversations();
    
    toast({
      title: "Beszélgetés lezárva",
      description: "A beszélgetés sikeresen lezárva.",
    });
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;
    
    setShowReopenConfirm(false);
    
    await supabase
      .from("conversations")
      .update({ status: "open" })
      .eq("id", selectedConversation.id);

    // Send email notification to visitor if they provided email
    if (selectedConversation.visitor_email) {
      try {
        await supabase.functions.invoke("send-chat-notification", {
          body: {
            type: "admin_reply",
            visitorName: selectedConversation.visitor_name,
            visitorEmail: selectedConversation.visitor_email,
            message: "A beszélgetését újra megnyitottuk. Kérjük, látogasson vissza weboldalunkra a chat folytatásához!",
            conversationId: selectedConversation.id,
          },
        });
      } catch (error) {
        console.error("Error sending reopen notification:", error);
      }
    }

    // Update local state
    setSelectedConversation({ ...selectedConversation, status: "open" });
    fetchConversations();
    
    toast({
      title: "Beszélgetés újranyitva",
      description: selectedConversation.visitor_email 
        ? "Az ügyfél értesítést kapott emailben." 
        : "Az ügyfél nem adott meg email címet.",
    });
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    setShowDeleteConfirm(false);
    
    // Delete messages first (cascade should handle this, but let's be safe)
    await supabase
      .from("chat_messages")
      .delete()
      .eq("conversation_id", conversationToDelete);
    
    // Delete conversation
    await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationToDelete);

    if (selectedConversation?.id === conversationToDelete) {
      setSelectedConversation(null);
    }
    
    setConversationToDelete(null);
    fetchConversations();
    
    toast({
      title: "Beszélgetés törölve",
      description: "A beszélgetés véglegesen törölve.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const confirmDelete = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(convId);
    setShowDeleteConfirm(true);
  };

  const renderRating = (rating: number | null, showLarge = false) => {
    if (!rating) return null;
    const size = showLarge ? "w-5 h-5" : "w-3 h-3";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground flex-shrink-0">
          <div className="flex items-center gap-2">
            {(selectedConversation || selectedCallback) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedConversation(null);
                  setSelectedCallback(null);
                }}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-semibold">
              {selectedConversation
                ? selectedConversation.visitor_name || "Névtelen"
                : selectedCallback
                ? selectedCallback.name
                : "Ügyfelek"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedConversation && selectedConversation.status === "closed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReopenConfirm(true)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="Beszélgetés újranyitása"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
            {selectedConversation && selectedConversation.status === "open" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCloseConfirm(true)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="Beszélgetés lezárása"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-card">
          {!selectedConversation && !selectedCallback ? (
            // Tab View
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chats" | "callbacks" | "questions")} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto flex-shrink-0">
                <TabsTrigger 
                  value="chats" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-4 py-3 text-sm text-muted-foreground"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="callbacks" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-4 py-3 text-sm text-muted-foreground"
                >
                  Visszahívás
                </TabsTrigger>
                <TabsTrigger 
                  value="questions" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-4 py-3 text-sm text-muted-foreground"
                >
                  Kérdések
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chats" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden min-h-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-border flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Keresés név vagy email alapján..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Betöltés...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery ? "Nincs találat" : "Nincsenek chat beszélgetések"}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="relative group"
                        >
                          <button
                            onClick={() => handleConversationSelect(conv)}
                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors pr-12"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {conv.visitor_name || "Névtelen látogató"}
                              </span>
                              <Badge variant={conv.status === "open" ? "default" : "secondary"}>
                                {conv.status === "open" ? "Nyitott" : "Lezárt"}
                              </Badge>
                            </div>
                            {conv.visitor_email && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {conv.visitor_email}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                {new Date(conv.created_at).toLocaleString("hu-HU")}
                              </p>
                              {renderRating(conv.rating)}
                            </div>
                            {conv.rating_text && (
                              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                                "{conv.rating_text}"
                              </p>
                            )}
                          </button>
                          <button
                            onClick={(e) => confirmDelete(conv.id, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Törlés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="callbacks" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden min-h-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-border flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Keresés név, email vagy telefon alapján..."
                      value={callbackSearchQuery}
                      onChange={(e) => setCallbackSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {callbacksLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Betöltés...</div>
                  ) : filteredCallbacks.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {callbackSearchQuery ? "Nincs találat" : "Nincsenek visszahívás kérések"}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredCallbacks.map((callback) => (
                        <div
                          key={callback.id}
                          className="relative group"
                        >
                          <button
                            onClick={() => setSelectedCallback(callback)}
                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors pr-12"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{callback.name}</span>
                              <Badge variant={callback.completed ? "secondary" : "default"}>
                                {callback.completed ? "Feldolgozva" : "Új"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{callback.phone}</span>
                            </div>
                            {callback.email && (
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{callback.email}</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(callback.created_at).toLocaleString("hu-HU")}
                            </p>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="questions" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden min-h-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-border flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Keresés a kérdések között..."
                      value={callbackSearchQuery}
                      onChange={(e) => setCallbackSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {callbacksLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Betöltés...</div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {callbackSearchQuery ? "Nincs találat" : "Nincsenek beküldött kérdések"}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="relative group"
                        >
                          <button
                            onClick={() => setSelectedCallback(question)}
                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors pr-12"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{question.name}</span>
                              <Badge variant={question.completed ? "secondary" : "default"}>
                                {question.completed ? "Megválaszolva" : "Új"}
                              </Badge>
                            </div>
                            {question.email && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{question.email}</span>
                              </div>
                            )}
                            {question.message && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {question.message}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(question.created_at).toLocaleString("hu-HU")}
                            </p>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : selectedCallback ? (
            // Callback Details View
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={selectedCallback.completed ? "secondary" : "default"} className="text-sm">
                  {selectedCallback.completed ? "Feldolgozva" : "Új kérés"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await toggleCompleted(selectedCallback.id, !selectedCallback.completed);
                    setSelectedCallback({ ...selectedCallback, completed: !selectedCallback.completed });
                    fetchCallbackRequests();
                    toast({
                      title: selectedCallback.completed ? "Kérés újranyitva" : "Kérés feldolgozva",
                    });
                  }}
                >
                  {selectedCallback.completed ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Újranyitás
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Feldolgozva
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <a href={`tel:${selectedCallback.phone}`} className="text-sm font-medium hover:underline">
                      {selectedCallback.phone}
                    </a>
                  </div>
                </div>
                
                {selectedCallback.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${selectedCallback.email}`} className="text-sm font-medium hover:underline">
                        {selectedCallback.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedCallback.message && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Üzenet</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedCallback.message}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Beküldve: {new Date(selectedCallback.created_at).toLocaleString("hu-HU")}
              </p>
              
              <div className="pt-4 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm("Biztosan törölni szeretné ezt a kérést?")) {
                      await deleteCallbackRequest(selectedCallback.id);
                      setSelectedCallback(null);
                      toast({ title: "Kérés törölve" });
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Kérés törlése
                </Button>
              </div>
            </div>
          ) : selectedConversation ? (
            // Messages View
            <>
              {/* Conversation Info */}
              {(selectedConversation.rating || selectedConversation.rating_text) && (
                <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
                  <p className="text-sm font-medium text-foreground mb-2">Ügyfél értékelése:</p>
                  <div className="flex items-center gap-3">
                    {renderRating(selectedConversation.rating, true)}
                    {selectedConversation.rating && (
                      <span className="text-sm text-muted-foreground">
                        ({selectedConversation.rating}/5)
                      </span>
                    )}
                  </div>
                  {selectedConversation.rating_text && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{selectedConversation.rating_text}"
                    </p>
                  )}
                </div>
              )}
              
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground">Betöltés...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Nincsenek üzenetek ebben a beszélgetésben
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender_type === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString("hu-HU")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input - only show for open conversations */}
              {selectedConversation.status === "open" && (
                <div className="p-4 border-t border-border flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Írjon választ..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedConversation.status === "closed" && (
                <div className="p-4 border-t border-border flex-shrink-0 text-center">
                  <p className="text-muted-foreground text-sm mb-2">Ez a beszélgetés le van zárva</p>
                  <Button variant="outline" size="sm" onClick={() => setShowReopenConfirm(true)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Újranyitás
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beszélgetés lezárása</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan le szeretné zárni ezt a beszélgetést?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégsem</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseConversation}>Lezárás</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Confirmation Dialog */}
      <AlertDialog open={showReopenConfirm} onOpenChange={setShowReopenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beszélgetés újranyitása</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan újra szeretné nyitni ezt a beszélgetést?
              {selectedConversation?.visitor_email && (
                <span className="block mt-2">
                  Az ügyfél ({selectedConversation.visitor_email}) értesítést kap emailben.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégsem</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopenConversation}>Újranyitás</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beszélgetés törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretné ezt a beszélgetést? Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Mégsem</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChatPanel;
