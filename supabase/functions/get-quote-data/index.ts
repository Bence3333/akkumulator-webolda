import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");

    if (!token && req.method !== "GET") {
      try {
        const body = await req.json();
        token = body?.token ? String(body.token) : null;
      } catch {
        token = null;
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appsScriptUrl = Deno.env.get("GOOGLE_APPS_SCRIPT_URL");
    if (!appsScriptUrl) {
      throw new Error("Missing GOOGLE_APPS_SCRIPT_URL configuration");
    }

    // Call Google Apps Script Web App
    const scriptRes = await fetch(
      `${appsScriptUrl}?action=quoteData&token=${encodeURIComponent(token)}`,
      { method: "GET", redirect: "follow" }
    );

    const data = await scriptRes.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
