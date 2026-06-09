import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import { EditableContentProvider } from "@/contexts/EditableContentContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QuoteRequest from "./pages/QuoteRequest";
import AdminQuotes from "./pages/AdminQuotes";
import Privacy from "./pages/Privacy";
import Impresszum from "./pages/Impresszum";
import Cookie from "./pages/Cookie";
import Auth from "./pages/Auth";
import Koszonjuk from "./pages/Koszonjuk";
import Koszonjuk2 from "./pages/Koszonjuk2";
import Kerdoiv from "./pages/Kerdoiv";
import Kerdoiv2 from "./pages/Kerdoiv2";
import Kerdoiv3 from "./pages/Kerdoiv3";
import Arajanlat from "./pages/Arajanlat";
import Adatbekero from "./pages/Adatbekero";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <EditableContentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/quote" element={<QuoteRequest />} />
              <Route path="/admin/quotes" element={<AdminQuotes />} />
              <Route path="/adatkezelesi-tajekoztato" element={<Privacy />} />
              <Route path="/impresszum" element={<Impresszum />} />
              <Route path="/cookie" element={<Cookie />} />
              <Route path="/koszonjuk" element={<Koszonjuk />} />
              <Route path="/koszonjuk2" element={<Koszonjuk2 />} />
              <Route path="/kerdoiv" element={<Kerdoiv />} />
              <Route path="/kerdoiv2" element={<Kerdoiv2 />} />
              <Route path="/kerdoiv3" element={<Kerdoiv3 />} />
              <Route path="/arajanlat" element={<Arajanlat />} />
              <Route path="/adatbekero" element={<Adatbekero />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </EditableContentProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
