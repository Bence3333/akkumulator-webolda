import { useState } from "react";
import { Plus, Trash2, MessageCircle, HelpCircle, Search } from "lucide-react";
import { useFaq, FaqItem } from "@/hooks/useFaq";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

interface FaqSectionProps {
  showContactCTA?: boolean;
  onContactClick?: () => void;
}

const FaqSection = ({ showContactCTA = true, onContactClick }: FaqSectionProps) => {
  const { items, loading, addItem, updateItem, deleteItem } = useFaq();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Kérjük, töltse ki mindkét mezőt!");
      return;
    }

    const result = await addItem(newQuestion, newAnswer);
    if (result.error) {
      toast.error("Hiba történt a kérdés hozzáadásakor");
    } else {
      toast.success("Kérdés sikeresen hozzáadva");
      setNewQuestion("");
      setNewAnswer("");
      setIsAddDialogOpen(false);
    }
  };

  const handleStartEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;

    const result = await updateItem(editingId, {
      question: editQuestion,
      answer: editAnswer,
    });

    if (result.error) {
      toast.error("Hiba történt a mentéskor");
    } else {
      toast.success("Kérdés sikeresen frissítve");
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteItem(id);
    if (result.error) {
      toast.error("Hiba történt a törléskor");
    } else {
      toast.success("Kérdés sikeresen törölve");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium text-sm">GYIK</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Gyakran Ismételt Kérdések
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Válaszok a leggyakrabban felmerülő kérdésekre napelemes rendszerekkel kapcsolatban
              </p>
            </ScrollReveal>
          </div>

          {/* Search & Add */}
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Keresés a kérdések között..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>
              {user && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-12 px-6">
                      <Plus className="h-4 w-4" />
                      Új kérdés
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Új kérdés hozzáadása</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Kérdés</label>
                        <Input
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Írja be a kérdést..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Válasz</label>
                        <Textarea
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          placeholder="Írja be a választ..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleAdd} className="w-full">
                        Hozzáadás
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </ScrollReveal>

          {/* FAQ Items */}
          {filteredItems.length === 0 ? (
            <ScrollReveal delay={400}>
              <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                {searchQuery ? "Nincs találat a keresésre." : "Még nincsenek kérdések hozzáadva."}
              </div>
            </ScrollReveal>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredItems.map((item, index) => (
                <ScrollReveal key={item.id} delay={400 + index * 100}>
                  <AccordionItem
                    value={item.id}
                    className="border border-border bg-card rounded-xl px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-300"
                  >
                    {editingId === item.id ? (
                      <div className="py-4 space-y-4">
                        <Input
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="font-medium"
                        />
                        <Textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Mentés
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Mégse
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <AccordionTrigger className="hover:no-underline py-5 gap-4">
                          <div className="flex items-center gap-4 text-left">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-medium text-base md:text-lg">
                              {item.question}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pl-12">
                          <p className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                          {user && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(item)}
                              >
                                Szerkesztés
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </>
                    )}
                  </AccordionItem>
                </ScrollReveal>
              ))}
            </Accordion>
          )}

          {/* Contact CTA */}
          {showContactCTA && (
            <ScrollReveal delay={600}>
              <div className="mt-16 text-center">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 md:p-12">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                    Nem találta meg a választ kérdésére?
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                    Írjon nekünk bátran, és kollégáink hamarosan válaszolnak!
                  </p>
                  <Button 
                    size="lg" 
                    className="gap-2 px-8"
                    onClick={onContactClick}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Kapcsolat felvétele
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
