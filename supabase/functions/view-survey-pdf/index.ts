import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return new Response("<html><body><h1>Hiányzó fájl azonosító</h1></body></html>", { 
        status: 400, 
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the HTML file from storage
    const filePath = `survey-pdfs/${fileId}.html`;
    const { data, error } = await supabase.storage
      .from("quote-images")
      .download(filePath);

    if (error) {
      console.error("Error downloading file:", error);
      return new Response("<html><body><h1>Fájl nem található</h1></body></html>", { 
        status: 404, 
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Get the HTML content
    const htmlContent = await data.text();

    // Return the HTML with proper content-type for rendering
    return new Response(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error viewing PDF:", message);
    return new Response(`<html><body><h1>Hiba: ${message}</h1></body></html>`, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
};

serve(handler);

