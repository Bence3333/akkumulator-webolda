import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, FileText, HelpCircle, ArrowLeft, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useFaq } from "@/hooks/useFaq";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ChatMode = "options" | "callback" | "quote" | "chat" | "rating" | "closed" | "faq";
type ChatTab = "chat" | "faq";

const COMPANY_PHONE = "+36 30 123 4567";

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("options");
  const [activeTab, setActiveTab] = useState<ChatTab>("chat");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [callbackMessage, setCallbackMessage] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, loading } = useChat(conversationId || undefined);
  const { items: faqItems, loading: faqLoading } = useFaq();

  // Filter FAQ items
  const filteredFaqItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  useEffect(() => {
    const savedConvId = localStorage.getItem("chat_conversation_id");
    const savedName = localStorage.getItem("chat_visitor_name");
    const savedEmail = localStorage.getItem("chat_visitor_email");
    const savedMode = localStorage.getItem("chat_mode");

    if (savedConvId && savedMode === "chat") {
      setConversationId(savedConvId);
      setMode("chat");
    }
    if (savedName) setVisitorName(savedName);
    if (savedEmail) setVisitorEmail(savedEmail);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCallbackRequest = async () => {
    if (!visitorName.trim() || !visitorPhone.trim()) return;

    try {
      const { error } = await supabase
        .from("callback_requests")
        .insert([{ 
          name: visitorName, 
          phone: visitorPhone, 
          email: visitorEmail || null,
          message: callbackMessage || null 
        }]);

      if (error) {
        console.error("Error saving callback request:", error);
        return;
      }

      await supabase.functions.invoke("send-chat-notification", {
        body: {
          type: "callback_request",
          visitorName,
          visitorPhone,
          visitorEmail: visitorEmail || null,
          message: callbackMessage || null,
        },
      });
      setCallbackSubmitted(true);
    } catch (error) {
      console.error("Error sending callback request:", error);
    }
  };

  const startChat = async () => {
    if (!visitorName.trim()) return;

    const { data, error } = await supabase
      .from("conversations")
      .insert([{ visitor_name: visitorName, visitor_email: visitorEmail || null }])
      .select()
      .single();

    if (error) {
      console.error("Error starting chat:", error);
      return;
    }

    if (data) {
      setConversationId(data.id);
      localStorage.setItem("chat_conversation_id", data.id);
      localStorage.setItem("chat_visitor_name", visitorName);
      localStorage.setItem("chat_mode", "chat");
      if (visitorEmail) {
        localStorage.setItem("chat_visitor_email", visitorEmail);
      }
      setMode("chat");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    const messageToSend = message;
    setMessage("");

    await sendMessage(conversationId, messageToSend, "visitor");

    try {
      await supabase.functions.invoke("send-chat-notification", {
        body: {
          type: "visitor_message",
          visitorName,
          visitorEmail,
          message: messageToSend,
          conversationId,
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleCloseChat = async () => {
    setShowCloseConfirm(false);
    setMode("rating");
  };

  const handleSubmitRating = async () => {
    if (conversationId) {
      const updateData: { status: string; rating?: number; rating_text?: string } = { status: "closed" };
      if (rating > 0) updateData.rating = rating;
      if (ratingText.trim()) updateData.rating_text = ratingText.trim();
      
      await supabase
        .from("conversations")
        .update(updateData)
        .eq("id", conversationId);
    }

    localStorage.removeItem("chat_conversation_id");
    localStorage.removeItem("chat_mode");
    
    setMode("closed");
    setConversationId(null);
    setRating(0);
    setRatingText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (mode === "callback") {
        handleCallbackRequest();
      } else if (mode === "chat" && conversationId) {
        handleSendMessage();
      } else if (mode === "chat" && !conversationId) {
        startChat();
      }
    }
  };

  const resetWidget = () => {
    setMode("options");
    setActiveTab("chat");
    setCallbackSubmitted(false);
    setVisitorPhone("");
  };

  const startNewChat = () => {
    setMode("options");
    setActiveTab("chat");
    setConversationId(null);
    setVisitorName("");
    setVisitorEmail("");
    setCallbackSubmitted(false);
  };

  const handleTabSelect = (tab: ChatTab) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
    if (tab === "faq") {
      setMode("faq");
    } else {
      setMode("options");
    }
  };

  const showDropdown = mode === "options" || mode === "faq";

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode !== "options" && mode !== "closed" && mode !== "rating" && mode !== "faq" && (
                  <button onClick={resetWidget} className="hover:opacity-80">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold">Miben segíthetünk?</h3>
                  {showDropdown && (
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-sm opacity-80 flex items-center gap-1 hover:opacity-100 transition-opacity"
                      >
                        {activeTab === "chat" ? "Chat & Kapcsolat" : "Gyakori kérdések"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                          <button
                            onClick={() => handleTabSelect("chat")}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-muted transition-colors ${activeTab === "chat" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <div>
                              <div className="font-medium text-foreground">Chat & Kapcsolat</div>
                              <div className="text-xs text-muted-foreground">Írjon nekünk üzenetet</div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleTabSelect("faq")}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-muted transition-colors ${activeTab === "faq" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                          >
                            <HelpCircle className="w-4 h-4" />
                            <div>
                              <div className="font-medium text-foreground">Gyakori kérdések</div>
                              <div className="text-xs text-muted-foreground">{faqItems.length} kérdés-válasz</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!showDropdown && (
                    <p className="text-sm opacity-80">
                      {mode === "chat" && conversationId ? "Élő beszélgetés" : "Válasszon az alábbi lehetőségek közül"}
                    </p>
                  )}
                </div>
              </div>
              {mode === "chat" && conversationId && (
                <button
                  onClick={() => setShowCloseConfirm(true)}
                  className="p-1.5 hover:bg-primary-foreground/10 rounded transition-colors"
                  title="Chat lezárása"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* FAQ Mode */}
            {mode === "faq" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border flex-shrink-0">
                  <Input
                    placeholder="Keresés a kérdések között..."
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {faqLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : filteredFaqItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {faqSearchQuery ? "Nincs találat a keresésre." : "Még nincsenek kérdések."}
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-2">
                      {filteredFaqItems.map((item) => (
                        <AccordionItem
                          key={item.id}
                          value={item.id}
                          className="border border-border bg-card rounded-lg px-4 data-[state=open]:border-primary/50"
                        >
                          <AccordionTrigger className="hover:no-underline py-3 text-sm">
                            <span className="text-left font-medium">{item.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3 text-sm text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
                {/* Contact CTA in FAQ */}
                <div className="p-4 border-t border-border flex-shrink-0 bg-muted/30">
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    Nem találta meg a választ?
                  </p>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => {
                      setActiveTab("chat");
                      setMode("chat");
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Kapcsolat felvétele
                  </Button>
                </div>
              </div>
            )}

            {/* Options Mode */}
            {mode === "options" && (
              <div className="p-4 space-y-3 overflow-y-auto">
                <button
                  onClick={() => setMode("callback")}
                  className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Visszahívást kérek</p>
                    <p className="text-sm text-muted-foreground">Hívjuk vissza Önt</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode("quote")}
                  className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Árajánlatot kérek</p>
                    <p className="text-sm text-muted-foreground">Személyre szabott ajánlat</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode("chat")}
                  className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Egyéb kérdés</p>
                    <p className="text-sm text-muted-foreground">Írjon nekünk üzenetet</p>
                  </div>
                </button>
              </div>
            )}

            {/* Callback Mode */}
            {mode === "callback" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                {callbackSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Visszahívás kérve!</h4>
                    <p className="text-muted-foreground text-sm">
                      Hamarosan felhívjuk a megadott telefonszámon.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground text-center">
                      Adja meg adatait, és visszahívjuk!
                    </p>
                    <Input
                      placeholder="Az Ön neve *"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                    />
                    <Input
                      placeholder="Telefonszám *"
                      type="tel"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                    />
                    <Input
                      placeholder="Email (opcionális)"
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                    />
                    <Textarea
                      placeholder="Üzenet (opcionális)"
                      value={callbackMessage}
                      onChange={(e) => setCallbackMessage(e.target.value)}
                      className="resize-none h-20"
                    />
                    <Button
                      onClick={handleCallbackRequest}
                      disabled={!visitorName.trim() || !visitorPhone.trim()}
                      className="w-full"
                    >
                      Visszahívást kérek
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Quote Mode */}
            {mode === "quote" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <p className="text-muted-foreground text-center mb-4">
                  Hogyan szeretne árajánlatot kérni?
                </p>
                
                <button
                  onClick={() => window.open(`tel:${COMPANY_PHONE}`, "_self")}
                  className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefonon</p>
                    <p className="text-sm text-muted-foreground">{COMPANY_PHONE}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/ajanlatkeres");
                  }}
                  className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Online űrlap</p>
                    <p className="text-sm text-muted-foreground">Részletes ajánlatkérés</p>
                  </div>
                </button>
              </div>
            )}

            {/* Chat Mode */}
            {mode === "chat" && (
              <>
                {!conversationId ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                    <p className="text-muted-foreground text-center">
                      Adja meg adatait a chat indításához
                    </p>
                    <Input
                      placeholder="Az Ön neve *"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="max-w-[220px]"
                    />
                    <Input
                      placeholder="Email (opcionális)"
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="max-w-[220px]"
                    />
                    <Button onClick={startChat} disabled={!visitorName.trim()}>
                      Chat indítása
                    </Button>
                  </div>
                ) : (
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {messages.length === 0 && !loading && (
                      <p className="text-muted-foreground text-center text-sm">
                        Írjon nekünk üzenetet!
                      </p>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === "visitor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender_type === "visitor"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Rating Mode */}
            {mode === "rating" && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4 overflow-y-auto">
                <h4 className="font-semibold text-foreground text-center">
                  Köszönjük a beszélgetést!
                </h4>
                <p className="text-muted-foreground text-center text-sm">
                  Kérjük, értékelje az ügyintézést:
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Szöveges visszajelzés (opcionális)"
                  value={ratingText}
                  onChange={(e) => setRatingText(e.target.value)}
                  className="w-full max-w-[250px] h-20 px-3 py-2 text-sm border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleSubmitRating} className="mt-2">
                  {rating > 0 || ratingText ? "Értékelés küldése" : "Kihagyás"}
                </Button>
              </div>
            )}

            {/* Closed Mode */}
            {mode === "closed" && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground text-center">
                  Köszönjük!
                </h4>
                <p className="text-muted-foreground text-center text-sm">
                  A beszélgetés lezárva. Köszönjük, hogy kapcsolatba lépett velünk!
                </p>
                <Button onClick={startNewChat} variant="outline">
                  Új beszélgetés indítása
                </Button>
              </div>
            )}
          </div>

          {/* Input - only show in chat mode with active conversation */}
          {mode === "chat" && conversationId && (
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Írjon üzenetet..."
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
        </div>
      )}

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat lezárása</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan le szeretné zárni a beszélgetést? A lezárás után már nem tud üzenetet küldeni.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégsem</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseChat}>Lezárás</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatWidget;
