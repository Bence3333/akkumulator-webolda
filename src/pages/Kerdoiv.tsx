import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import EditableText from "@/components/EditableText";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SurveyCategory from "@/components/survey/SurveyCategory";
import SurveyQuestionCard, { SurveyQuestion, QuestionType } from "@/components/survey/SurveyQuestionCard";
import AddQuestionForm from "@/components/survey/AddQuestionForm";
import AddCategoryForm from "@/components/survey/AddCategoryForm";
import PropertyOwnersSection from "@/components/survey/PropertyOwnersSection";
import BeneficiariesSection, { Beneficiary } from "@/components/survey/BeneficiariesSection";
import FileUploadSection, { UploadedFile } from "@/components/survey/FileUploadSection";

interface SurveyCategoryData {
  id: string;
  name: string;
  sort_order: number;
}

interface Owner {
  id: string;
  name: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
  ownershipShareNumerator: string;
  ownershipShareDenominator: string;
}

interface KerdoivProps {
  surveyId?: number;
  sheetName?: string;
  title?: string;
  showOwners?: boolean;
  showBeneficiaries?: boolean;
  showFileUpload?: boolean;
  showConsents?: boolean;
}

export default function Kerdoiv({ surveyId = 1, sheetName = "Kerdoiv", title = "Kérdőív", showOwners = true, showBeneficiaries = true, showFileUpload = true, showConsents = true }: KerdoivProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAdmin();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [categories, setCategories] = useState<SurveyCategoryData[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [owners, setOwners] = useState<Owner[]>([]);
  const [hasBeneficiaries, setHasBeneficiaries] = useState<boolean | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [invalidOwnerIndices, setInvalidOwnerIndices] = useState<Set<number>>(new Set());
  const [invalidBeneficiaryIndices, setInvalidBeneficiaryIndices] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-fill email from URL parameter
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl && questions.length > 0) {
      const emailQuestion = questions.find(q => 
        q.question_text.toLowerCase().includes("email") || 
        q.question_text.toLowerCase().includes("e-mail") ||
        q.question_type === "email"
      );
      if (emailQuestion && !answers[emailQuestion.id]) {
        setAnswers(prev => ({ ...prev, [emailQuestion.id]: emailFromUrl }));
      }
    }
  }, [searchParams, questions]);

  // Expand all categories by default
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
  }, [categories]);

  const fetchData = async () => {
    try {
      const [questionsRes, categoriesRes] = await Promise.all([
        (supabase
          .from("survey_questions")
          .select("*") as any)
          .eq("survey_id", surveyId)
          .order("sort_order", { ascending: true }),
        (supabase
          .from("survey_categories")
          .select("*") as any)
          .eq("survey_id", surveyId)
          .order("sort_order", { ascending: true }),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const typedQuestions: SurveyQuestion[] = (questionsRes.data || []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as QuestionType,
        options: q.options || [],
        sort_order: q.sort_order,
        required: q.required,
        category_id: q.category_id,
        description: q.description,
      }));

      setQuestions(typedQuestions);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Hiba történt az adatok betöltésekor");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Group questions by category
  const groupedQuestions = useMemo(() => {
    const groups: { category: SurveyCategoryData | null; questions: SurveyQuestion[] }[] = [];
    
    // Add category groups
    categories.forEach(cat => {
      const catQuestions = questions.filter(q => q.category_id === cat.id);
      if (catQuestions.length > 0 || isAdmin) {
        groups.push({ category: cat, questions: catQuestions });
      }
    });
    
    // Add uncategorized questions
    const uncategorized = questions.filter(q => !q.category_id);
    if (uncategorized.length > 0 || isAdmin) {
      groups.push({ category: null, questions: uncategorized });
    }
    
    return groups;
  }, [questions, categories, isAdmin]);

  const handleQuestionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newQuestions = arrayMove(questions, oldIndex, newIndex);
    setQuestions(newQuestions);

    // Update sort_order in database
    try {
      const updates = newQuestions.map((q, index) => ({
        id: q.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("survey_questions")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error updating question order:", error);
      toast.error("Hiba történt a sorrend mentésekor");
      fetchData();
    }
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    // Update sort_order in database
    try {
      const updates = newCategories.map((c, index) => ({
        id: c.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("survey_categories")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Hiba történt a sorrend mentésekor");
      fetchData();
    }
  };

  const handleSubmit = async () => {
    // Custom validation for different question types
    const isAnswerValid = (question: SurveyQuestion, answer: string | undefined): boolean => {
      if (!answer) return false;
      
      // For ownership_share type, check if both parts are filled
      if (question.question_type === "ownership_share") {
        const [numerator, denominator] = answer.split("/");
        return !!numerator?.trim() && !!denominator?.trim();
      }
      
      return !!answer.trim();
    };
    
    const unanswered = questions.filter(q => q.required && !isAnswerValid(q, answers[q.id]));
    
    // Validate owner fields
    const invalidOwnerIndices = new Set<number>();
    if (showOwners) {
      owners.forEach((owner, index) => {
        if (!owner.name.trim() || !owner.birthPlace.trim() || !owner.birthDate.trim() || !owner.motherName.trim() || !owner.ownershipShareNumerator.trim() || !owner.ownershipShareDenominator.trim()) {
          invalidOwnerIndices.add(index);
        }
      });
    }

    // Validate beneficiary fields
    const invalidBeneficiaryIndices = new Set<number>();
    if (showBeneficiaries && hasBeneficiaries === true) {
      beneficiaries.forEach((b, index) => {
        if (!b.name.trim() || !b.birthPlace.trim() || !b.birthDate.trim() || !b.motherName.trim()) {
          invalidBeneficiaryIndices.add(index);
        }
      });
    }

    const hasOwnerErrors = invalidOwnerIndices.size > 0;
    const hasBeneficiaryErrors = invalidBeneficiaryIndices.size > 0;

    if (unanswered.length > 0 || hasOwnerErrors || hasBeneficiaryErrors) {
      setInvalidFields(new Set(unanswered.map(q => q.id)));
      setInvalidOwnerIndices(invalidOwnerIndices);
      setInvalidBeneficiaryIndices(invalidBeneficiaryIndices);
      toast.error("Kérjük, töltsön ki minden kötelező mezőt");
      // Scroll to the first invalid element
      if (unanswered.length > 0) {
        const element = document.getElementById(`question-${unanswered[0].id}`);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (hasOwnerErrors) {
        const element = document.getElementById("property-owners-section");
        if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (hasBeneficiaryErrors) {
        const element = document.getElementById("beneficiaries-section");
        if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    
    // Clear invalid fields if validation passes
    setInvalidFields(new Set());
    setInvalidOwnerIndices(new Set());
    setInvalidBeneficiaryIndices(new Set());

    if (showConsents && (!privacyAccepted || !declarationAccepted || !authorizationAccepted)) {
      toast.error("Kérjük, fogadja el az összes kötelező nyilatkozatot");
      return;
    }

    setIsSubmitting(true);

    try {
      const surveyData: Record<string, string> = {};
      questions.forEach(q => {
        surveyData[q.question_text] = answers[q.id] || "";
      });

      // Add owners data
      if (owners.length > 0) {
        surveyData["Tulajdonosok száma"] = String(owners.length);
        owners.forEach((owner, index) => {
          const prefix = `Tulajdonos ${index + 1}`;
          surveyData[`${prefix} - Név`] = owner.name;
          surveyData[`${prefix} - Születési hely`] = owner.birthPlace;
          surveyData[`${prefix} - Születési dátum`] = owner.birthDate;
          surveyData[`${prefix} - Anyja neve`] = owner.motherName;
          surveyData[`${prefix} - Tulajdoni hányad`] = `${owner.ownershipShareNumerator}/${owner.ownershipShareDenominator}`;
        });
      }

      // Add beneficiaries data (only if section is shown)
      if (showBeneficiaries) {
        surveyData["Haszonélvezeti joggal terhelt"] = hasBeneficiaries === null ? "" : (hasBeneficiaries ? "Igen" : "Nem");
        if (hasBeneficiaries && beneficiaries.length > 0) {
          surveyData["Haszonélvezők száma"] = String(beneficiaries.length);
          beneficiaries.forEach((beneficiary, index) => {
            const prefix = `Haszonélvező ${index + 1}`;
            surveyData[`${prefix} - Név`] = beneficiary.name;
            surveyData[`${prefix} - Születési hely`] = beneficiary.birthPlace;
            surveyData[`${prefix} - Születési dátum`] = beneficiary.birthDate;
            surveyData[`${prefix} - Anyja neve`] = beneficiary.motherName;
          });
        }
      }

      // Add uploaded files data
      if (uploadedFiles.length > 0) {
        surveyData["Feltöltött fájlok száma"] = String(uploadedFiles.length);
        uploadedFiles.forEach((file, index) => {
          surveyData[`Fájl ${index + 1}`] = file.url;
        });
      }
      // Prepare data for PDF generation
      const ownersForPdf = owners.map(o => ({
        name: o.name,
        birthPlace: o.birthPlace,
        birthDate: o.birthDate,
        motherName: o.motherName,
        ownershipShare: `${o.ownershipShareNumerator}/${o.ownershipShareDenominator}`,
      }));

      const beneficiariesForPdf = beneficiaries.map(b => ({
        name: b.name,
        birthPlace: b.birthPlace,
        birthDate: b.birthDate,
        motherName: b.motherName,
      }));

      // Prepare grouped data for PDF - questions organized by category
      const groupedDataForPdf = groupedQuestions.map(group => ({
        categoryName: group.category?.name || "Egyéb kérdések",
        questions: group.questions.map(q => ({
          question: q.question_text,
          answer: answers[q.id] || "",
        })),
      })).filter(g => g.questions.length > 0);

      // Prepare uploaded files for PDF
      const filesForPdf = uploadedFiles.map(f => ({
        name: f.name,
        url: f.url,
      }));

      const { error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "survey",
          surveyData,
          groupedData: groupedDataForPdf,
          owners: ownersForPdf,
          beneficiaries: beneficiariesForPdf,
          hasBeneficiaries,
          uploadedFiles: filesForPdf,
          skipEmails: true,
          sheetName,
        },
      });

      if (error) throw error;

      toast.success("Kérdőív sikeresen elküldve!");
      navigate("/koszonjuk2");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Hiba történt a kérdőív beküldésekor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailLocked = (question: SurveyQuestion) => {
    const isEmailField = question.question_text.toLowerCase().includes("email") || 
                        question.question_text.toLowerCase().includes("e-mail") ||
                        question.question_type === "email";
    return isEmailField && !!searchParams.get("email");
  };

  // Calculate global question index
  const getGlobalIndex = (question: SurveyQuestion) => {
    return questions.findIndex(q => q.id === question.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/sparksolar-logo-new.png"
              alt="SparkSolar"
              className="h-16 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">
            Kérjük, töltse ki az alábbi kérdőívet
          </p>
        </div>

        {/* Admin: Add category button */}
        {isAdmin && (
          <div className="mb-6">
            <AddCategoryForm
              maxSortOrder={Math.max(...categories.map(c => c.sort_order), -1)}
              onRefresh={fetchData}
              surveyId={surveyId}
            />
          </div>
        )}

        {/* Questions grouped by category */}
        <div className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {groupedQuestions.map((group) => {
                if (group.category) {
                  return (
                    <SurveyCategory
                      key={group.category.id}
                      id={group.category.id}
                      name={group.category.name}
                      isAdmin={isAdmin}
                      isExpanded={expandedCategories.has(group.category.id)}
                      onToggle={() => toggleCategory(group.category!.id)}
                      onRefresh={fetchData}
                    >
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleQuestionDragEnd}
                      >
                        <SortableContext
                          items={group.questions.map(q => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {group.questions.map((question) => (
                            <SurveyQuestionCard
                              key={question.id}
                              question={question}
                              index={getGlobalIndex(question)}
                              isAdmin={isAdmin}
                              categories={categories}
                              answer={answers[question.id] || ""}
                              onAnswerChange={(value) => {
                                setAnswers({ ...answers, [question.id]: value });
                                // Clear error when user starts typing
                                if (invalidFields.has(question.id)) {
                                  setInvalidFields(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(question.id);
                                    return newSet;
                                  });
                                }
                              }}
                              onRefresh={fetchData}
                              isEmailLocked={isEmailLocked(question)}
                              allAnswers={answers}
                              allQuestions={questions}
                              showError={invalidFields.has(question.id)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      {group.questions.length === 0 && isAdmin && (
                        <p className="text-muted-foreground text-sm italic">
                          Nincs kérdés ebben a kategóriában
                        </p>
                      )}
                    </SurveyCategory>
                  );
                } else {
                  // Uncategorized questions
                  return (
                    <div key="uncategorized" className="space-y-4">
                      {isAdmin && categories.length > 0 && (
                        <h2 className="font-semibold text-lg text-muted-foreground">
                          Kategória nélküli kérdések
                        </h2>
                      )}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleQuestionDragEnd}
                      >
                        <SortableContext
                          items={group.questions.map(q => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {group.questions.map((question) => (
                            <SurveyQuestionCard
                              key={question.id}
                              question={question}
                              index={getGlobalIndex(question)}
                              isAdmin={isAdmin}
                              categories={categories}
                              answer={answers[question.id] || ""}
                              onAnswerChange={(value) => {
                                setAnswers({ ...answers, [question.id]: value });
                                // Clear error when user starts typing
                                if (invalidFields.has(question.id)) {
                                  setInvalidFields(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(question.id);
                                    return newSet;
                                  });
                                }
                              }}
                              onRefresh={fetchData}
                              isEmailLocked={isEmailLocked(question)}
                              allAnswers={answers}
                              allQuestions={questions}
                              showError={invalidFields.has(question.id)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  );
                }
              })}
            </SortableContext>
          </DndContext>

          {/* Add question button for admin */}
          {isAdmin && (
            <AddQuestionForm
              categories={categories}
              maxSortOrder={Math.max(...questions.map(q => q.sort_order), -1)}
              onRefresh={fetchData}
              surveyId={surveyId}
            />
          )}

          {/* Property owners section */}
          {showOwners && questions.length > 0 && (
            <PropertyOwnersSection
              owners={owners}
              onOwnersChange={(newOwners) => {
                setOwners(newOwners);
                setInvalidOwnerIndices(new Set());
              }}
              isAdmin={isAdmin}
              invalidIndices={invalidOwnerIndices}
            />
          )}

          {/* Beneficiaries section */}
          {showBeneficiaries && questions.length > 0 && (
            <BeneficiariesSection
              hasBeneficiaries={hasBeneficiaries}
              onHasBeneficiariesChange={setHasBeneficiaries}
              beneficiaries={beneficiaries}
              onBeneficiariesChange={(newBeneficiaries) => {
                setBeneficiaries(newBeneficiaries);
                setInvalidBeneficiaryIndices(new Set());
              }}
              isAdmin={isAdmin}
              invalidIndices={invalidBeneficiaryIndices}
            />
          )}

          {/* File upload section */}
          {showFileUpload && questions.length > 0 && (
            <FileUploadSection
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              isAdmin={isAdmin}
            />
          )}

          {/* Consents section */}
          {showConsents && questions.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-4">
              <h3 className="font-semibold text-foreground mb-4">
                <EditableText
                  initialText="Kötelező nyilatkozatok"
                  storageKey="survey_consents_title"
                  as="span"
                />
              </h3>

              {/* Declaration consent */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="declaration"
                  checked={declarationAccepted}
                  onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="declaration" className="text-sm text-muted-foreground cursor-pointer">
                  <EditableText
                    initialText="Pályázóként nyilatkozom, hogy a beruházással érintett lakóingatlan valamennyi tulajdonosa és haszonélvezője vonatkozásában az összeférhetetlenség nem áll fenn, továbbá elfogadom a fennálló kötelezettségeket, megfelelek az Otthoni Energiatároló Program Felhívásában foglalt feltételeknek, és elfogadom a pályázati feltételeket."
                    storageKey="survey_declaration_text"
                    as="span"
                    multiline
                  />
                  {" *"}
                </label>
              </div>

              {/* Authorization consent */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="authorization"
                  checked={authorizationAccepted}
                  onCheckedChange={(checked) => setAuthorizationAccepted(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="authorization" className="text-sm text-muted-foreground cursor-pointer">
                  <EditableText
                    initialText="Hozzájárulok, hogy az Otthoni Energiatároló Program kapcsán meghatalmazottként az Spark Electric Kft. megbízottja adja be helyettem a pályázatomat."
                    storageKey="survey_authorization_text"
                    as="span"
                    multiline
                  />
                  {" *"}
                </label>
              </div>

              {/* Privacy consent */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm text-muted-foreground cursor-pointer">
                  <EditableText
                    initialText="Elolvastam és elfogadom az"
                    storageKey="survey_privacy_prefix_text"
                    as="span"
                  />
                  {" "}
                  <Link
                    to="/adatkezelesi-tajekoztato"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    <EditableText
                      initialText="adatkezelési tájékoztatót"
                      storageKey="survey_privacy_link_text"
                      as="span"
                    />
                  </Link>
                  . *
                </label>
              </div>
            </div>
          )}

          {/* Submit button */}
          {questions.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (showConsents && (!privacyAccepted || !declarationAccepted || !authorizationAccepted))}
              className="w-full py-6 text-lg font-semibold"
              size="lg"
            >
              {isSubmitting ? "Küldés..." : "Kérdőív beküldése"}
            </Button>
          )}

          {questions.length === 0 && !isAdmin && (
            <div className="text-center py-12 text-muted-foreground">
              Jelenleg nincsenek kérdések a kérdőívben.
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  );
}
