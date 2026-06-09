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
    const { token, selectedExtras } = await req.json();

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

    // Call Google Apps Script to accept the quote
    const scriptRes = await fetch(appsScriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "acceptQuote",
        token,
        selectedExtras: selectedExtras || [],
      }),
    });

    const data = await scriptRes.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send notification email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      // Fetch quote data for email content
      const quoteRes = await fetch(
        `${appsScriptUrl}?action=quoteData&token=${encodeURIComponent(token)}`,
        { method: "GET", redirect: "follow" }
      );
      const quoteData = await quoteRes.json();

      const extrasHtml = selectedExtras?.length
        ? `<h3>Választott extrák:</h3><ul>${selectedExtras.map((e: { name: string; quantity: number; price: string }) => `<li>${e.name} - ${e.quantity} db - ${e.price}</li>`).join("")}</ul>`
        : "";

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SparkSolar <info@akkumulator-tamogatas.hu>",
          to: ["bencehegedus89@gmail.com", "info@sparkvill.hu"],
          subject: `✅ Árajánlat elfogadva - ${quoteData.customerName || "Ismeretlen ügyfél"}`,
          html: `
            <h2>Egy ügyfél elfogadta az árajánlatot!</h2>
            <p><strong>Ügyfél:</strong> ${quoteData.customerName || "N/A"}</p>
            <p><strong>Email:</strong> ${quoteData.email || "N/A"}</p>
            <p><strong>Önrész:</strong> ${quoteData.selfContribution || "N/A"}</p>
            ${extrasHtml}
            <p><em>Elfogadva: ${data.acceptedAt}</em></p>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
