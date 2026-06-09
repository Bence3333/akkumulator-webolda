import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load overlay components to avoid portal issues
import { lazy, Suspense } from "react";

const ChatWidget = lazy(() => import("./ChatWidget"));
const AdminChatPanel = lazy(() => import("./AdminChatPanel"));
const PinnedStringsOverlay = lazy(() => import("./PinnedStringsOverlay"));

// Context to share chat panel state with Layout
import { createContext, useContext } from "react";

interface ChatPanelContextType {
  isChatPanelOpen: boolean;
  setIsChatPanelOpen: (open: boolean) => void;
}

const ChatPanelContext = createContext<ChatPanelContextType>({
  isChatPanelOpen: false,
  setIsChatPanelOpen: () => {},
});

export const useChatPanel = () => useContext(ChatPanelContext);

export const GlobalOverlaysProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Delay mounting overlays to avoid hydration issues
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render overlays during auth loading or before mounted
  if (loading || !mounted) {
    return (
      <ChatPanelContext.Provider value={{ isChatPanelOpen, setIsChatPanelOpen }}>
        {children}
      </ChatPanelContext.Provider>
    );
  }

  return (
    <ChatPanelContext.Provider value={{ isChatPanelOpen, setIsChatPanelOpen }}>
      {children}
      
      <Suspense fallback={null}>
        {/* Chat Widget for visitors - only render when no user */}
        {!user && <ChatWidget />}

        {/* Admin Chat Panel - only render when open */}
        {user && isChatPanelOpen && (
          <AdminChatPanel isOpen={isChatPanelOpen} onClose={() => setIsChatPanelOpen(false)} />
        )}

        {/* Pinned Strings Overlay - always render for logged in users */}
        {user && <PinnedStringsOverlay />}
      </Suspense>
    </ChatPanelContext.Provider>
  );
};

export default GlobalOverlaysProvider;
