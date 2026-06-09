import { useState, useEffect } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import EditableText from "@/components/EditableText";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const defaultFAQs: Omit<FAQItem, 'id'>[] = [
  {
    question: "Mennyi idő alatt térül meg a napelemes rendszer?",
    answer: "A jelenlegi 80%-os támogatással a rendszer akár 3-5 év alatt megtérülhet, míg támogatás nélkül ez 6-8 év lenne. Az akkumulátorral kiegészített rendszerek még nagyobb megtakarítást biztosítanak.",
    sort_order: 0
  },
  {
    question: "Ki igényelheti a 80%-os támogatást?",
    answer: "A pályázat lakossági igénylők számára érhető el, akik saját tulajdonú ingatlanra szeretnének napelemes rendszert telepíteni. Részletes feltételekért kérjen személyre szabott tájékoztatást.",
    sort_order: 1
  },
  {
    question: "Mennyi ideig tart a telepítés?",
    answer: "A telepítés általában 1-2 napot vesz igénybe a rendszer méretétől függően. A teljes folyamat a felmérésétől az üzembe helyezésig 4-8 hét.",
    sort_order: 2
  },
  {
    question: "Mi történik ha nincs napsütés?",
    answer: "Borult időben is termel a napelem, csak kevesebbet. Az akkumulátoros tárolóval a napos időszakban termelt felesleget éjszaka vagy borult napokon is felhasználhatja.",
    sort_order: 3
  }
];

const FAQ = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { isAdmin } = useAdmin();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load FAQs from database
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('faq_items')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error loading FAQs:', error);
          return;
        }

        if (data && data.length > 0) {
          setFaqs(data);
        } else {
          // Insert default FAQs if none exist
          const { data: insertedData, error: insertError } = await supabase
            .from('faq_items')
            .insert(defaultFAQs)
            .select();

          if (insertError) {
            console.error('Error inserting default FAQs:', insertError);
          } else if (insertedData) {
            setFaqs(insertedData);
          }
        }
      } catch (err) {
        console.error('Error loading FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const updateFAQ = async (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));

    // Save to database
    const { error } = await supabase
      .from('faq_items')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const addFAQ = async () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const newFaq = {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        sort_order: faqs.length
      };

      const { data, error } = await supabase
        .from('faq_items')
        .insert(newFaq)
        .select()
        .single();

      if (error) {
        console.error('Error adding FAQ:', error);
        return;
      }

      if (data) {
        setFaqs([...faqs, data]);
      }

      setNewQuestion("");
      setNewAnswer("");
      setIsAdding(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FAQ:', error);
      return;
    }

    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  if (isLoading) {
    return (
      <section id="faq" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <div ref={ref} className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="animate-pulse h-4 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div ref={ref} className="container mx-auto px-4">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-4">
            <span className="w-8 h-0.5 bg-primary rounded-full" />
            GYIK
            <span className="w-8 h-0.5 bg-primary rounded-full" />
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Gyakran Ismételt Kérdések"
              storageKey="faq-title"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableText 
              initialText="Válaszok a leggyakoribb kérdésekre"
              storageKey="faq-subtitle"
            />
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`group rounded-2xl overflow-hidden transition-all duration-500 ${
                openId === faq.id 
                  ? 'bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 shadow-xl shadow-primary/10' 
                  : 'bg-card border-2 border-border/50 hover:border-primary/30 hover:shadow-lg'
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                onClick={() => !isAdmin || editingId !== faq.id ? toggleFAQ(faq.id) : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleFAQ(faq.id)}
                className={`w-full flex items-center justify-between p-6 text-left transition-all duration-300 cursor-pointer ${
                  openId === faq.id ? '' : 'hover:bg-muted/30'
                }`}
              >
                {isAdmin && editingId === faq.id ? (
                  <input
                    value={faq.question}
                    onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    className="flex-1 bg-primary/10 border border-primary rounded px-2 py-1 mr-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className={`font-heading font-semibold text-lg pr-4 transition-colors ${
                      openId === faq.id ? 'text-primary' : 'text-foreground group-hover:text-primary'
                    }`}
                    onClick={(e) => {
                      if (isAdmin) {
                        e.stopPropagation();
                        setEditingId(faq.id);
                      }
                    }}
                  >
                    {faq.question}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFAQ(faq.id);
                      }}
                      role="button"
                      tabIndex={0}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openId === faq.id 
                      ? 'bg-destructive text-destructive-foreground' 
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    {openId === faq.id ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`grid transition-all duration-500 ease-in-out ${
                openId === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}>
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-primary/20 pt-4">
                    {isAdmin ? (
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                        className="w-full bg-primary/10 border border-primary rounded p-2 min-h-[80px] resize-y"
                      />
                    ) : (
                      faq.answer
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New FAQ - Admin Only */}
          {isAdmin && (
            <div className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              {isAdding ? (
                <div className="bg-card rounded-2xl border-2 border-primary/30 p-6 space-y-4">
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Kérdés..."
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3"
                  />
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Válasz..."
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 min-h-[100px] resize-y"
                  />
                  <div className="flex gap-3">
                    <Button variant="hero" size="sm" onClick={addFAQ}>
                      Hozzáadás
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                      Mégse
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-primary/30 rounded-2xl text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Új kérdés hozzáadása
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
