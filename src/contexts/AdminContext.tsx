import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_CACHE_KEY = 'spark_admin_status';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Initialize from localStorage cache for faster initial render
    try {
      const cached = localStorage.getItem(ADMIN_CACHE_KEY);
      if (cached) {
        const { isAdmin, expiry } = JSON.parse(cached);
        if (expiry > Date.now()) {
          return isAdmin;
        }
      }
    } catch (e) {
      console.error('Error reading admin cache:', e);
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      const adminStatus = data === true;
      
      // Cache the result in localStorage (valid for 1 hour)
      try {
        localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
          isAdmin: adminStatus,
          userId: userId,
          expiry: Date.now() + (60 * 60 * 1000) // 1 hour
        }));
      } catch (e) {
        console.error('Error caching admin status:', e);
      }
      
      return adminStatus;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer admin check with setTimeout to avoid deadlocks
        if (currentSession?.user) {
          setTimeout(async () => {
            const hasAdminRole = await checkAdminRole(currentSession.user.id);
            console.log('Admin role check result:', hasAdminRole);
            setIsAdmin(hasAdminRole);
            setIsLoading(false);
          }, 0);
        } else {
          // Clear cache on logout
          try {
            localStorage.removeItem(ADMIN_CACHE_KEY);
          } catch (e) {
            console.error('Error clearing admin cache:', e);
          }
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      console.log('Existing session check:', existingSession?.user?.email);
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        const hasAdminRole = await checkAdminRole(existingSession.user.id);
        console.log('Initial admin role check:', hasAdminRole);
        setIsAdmin(hasAdminRole);
      } else {
        // No session - check if we have a cached admin status (might be stale)
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem(ADMIN_CACHE_KEY);
    } catch (e) {
      console.error('Error clearing admin cache:', e);
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, user, session, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
