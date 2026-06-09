import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  has_solar?: boolean;
  inverter_brand?: string;
  notes?: string;
  type: "quote" | "callback" | "quick_quote" | "package_select";
  package_title?: string;
  package_code?: string;
  battery_size?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLICKUP_API_TOKEN = Deno.env.get("CLICKUP_API_TOKEN");
    const CLICKUP_LIST_ID = Deno.env.get("CLICKUP_LIST_ID");

    if (!CLICKUP_API_TOKEN || !CLICKUP_LIST_ID) {
      console.error("Missing ClickUp configuration");
      throw new Error("Missing ClickUp API token or List ID");
    }

    const data: TaskData = await req.json();
    console.log("Creating ClickUp task for:", data.type, data.name);

    // Build task name based on type
    let taskName = "";
    switch (data.type) {
      case "quote":
        taskName = `🔆 Árajánlatkérés - ${data.name}`;
        break;
      case "callback":
        taskName = `📞 Visszahívás - ${data.name}`;
        break;
      case "quick_quote":
        taskName = `⚡ Gyors ajánlatkérés - ${data.name}`;
        break;
      case "package_select":
        taskName = `📦 Csomag érdeklődés - ${data.name} (${data.package_title || data.package_code})`;
        break;
      default:
        taskName = `Új érdeklődés - ${data.name}`;
    }

    // Build description
    const descriptionParts: string[] = [
      `**Név:** ${data.name}`,
      `**Email:** ${data.email}`,
      `**Telefon:** ${data.phone}`,
    ];

    if (data.address) {
      descriptionParts.push(`**Cím:** ${data.address}`);
    }

    if (data.type === "quote" || data.type === "quick_quote" || data.type === "package_select") {
      if (data.has_solar !== undefined) {
        descriptionParts.push(`**Van napeleme:** ${data.has_solar ? "Igen" : "Nem"}`);
      }
      if (data.inverter_brand) {
        descriptionParts.push(`**Inverter márka:** ${data.inverter_brand}`);
      }
    }

    if (data.package_title) {
      descriptionParts.push(`**Csomag:** ${data.package_title}`);
    }

    if (data.battery_size) {
      descriptionParts.push(`**Akkumulátor méret:** ${data.battery_size}`);
    }

    if (data.package_code) {
      descriptionParts.push(`**Csomag kód:** ${data.package_code}`);
    }

    if (data.notes) {
      descriptionParts.push(`\n**Megjegyzés:**\n${data.notes}`);
    }

    descriptionParts.push(`\n---\n*Beküldve: ${new Date().toLocaleString("hu-HU")}*`);

    const description = descriptionParts.join("\n");

    // Create task in ClickUp
    const response = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLICKUP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: taskName,
        description: description,
        markdown_description: description,
        status: "AKKUMULATOR-TAMOGATAS.HU Ü",
        tags: [data.type],
        priority: data.type === "callback" ? 2 : 3, // 2 = high, 3 = normal
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ClickUp API error:", response.status, errorText);
      throw new Error(`ClickUp API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("ClickUp task created successfully:", result.id);

    return new Response(
      JSON.stringify({ success: true, taskId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating ClickUp task:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
