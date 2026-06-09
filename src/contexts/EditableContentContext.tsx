import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EditableContentContextType {
  content: Record<string, string>;
  isLoading: boolean;
  updateContent: (storageKey: string, newContent: string) => Promise<void>;
}

const EditableContentContext = createContext<EditableContentContextType | undefined>(undefined);

export const EditableContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all content in a single query
  useEffect(() => {
    const loadAllContent = async () => {
      try {
        const { data, error } = await supabase
          .from('editable_content')
          .select('storage_key, content');

        if (error) {
          console.error('Error loading editable content:', error);
          return;
        }

        if (data) {
          const contentMap: Record<string, string> = {};
          data.forEach(item => {
            contentMap[item.storage_key] = item.content;
          });
          setContent(contentMap);
        }
      } catch (err) {
        console.error('Error loading editable content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllContent();
  }, []);

  // Update content both locally and in database
  const updateContent = useCallback(async (storageKey: string, newContent: string) => {
    // Optimistic update
    setContent(prev => ({ ...prev, [storageKey]: newContent }));

    try {
      const { error } = await supabase
        .from('editable_content')
        .upsert(
          { storage_key: storageKey, content: newContent },
          { onConflict: 'storage_key' }
        );

      if (error) {
        console.error('Error saving content:', error);
      }
    } catch (err) {
      console.error('Error saving content:', err);
    }
  }, []);

  return (
    <EditableContentContext.Provider value={{ content, isLoading, updateContent }}>
      {children}
    </EditableContentContext.Provider>
  );
};

export const useEditableContent = () => {
  const context = useContext(EditableContentContext);
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};
