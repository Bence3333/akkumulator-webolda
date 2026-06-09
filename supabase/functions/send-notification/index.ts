import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["bencehegedus89@gmail.com", "mehdi_huseyni@ymail.com", "info@sparkvill.hu"];

interface NotificationData {
  name: string;
  phone: string;
  email: string;
  address?: string;
  hasSolar?: boolean;
  inverterBrand?: string;
  roofType?: string;
  roofOrientation?: string;
  roofAngle?: number;
  annualConsumption?: number;
  preferredDay?: string;
  preferredTime?: string;
  notes?: string;
  packageTitle?: string;
  packageCode?: string;
  batterySize?: string;
  images?: string[];
}

interface SurveyData {
  [key: string]: string;
}

interface Owner {
  name: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
  ownershipShare: string;
}

interface Beneficiary {
  name: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
}

interface NotificationRequest {
  type: "quote" | "callback" | "quick_quote" | "package_select" | "survey";
  data?: NotificationData;
  surveyData?: SurveyData;
  owners?: Owner[];
  beneficiaries?: Beneficiary[];
  hasBeneficiaries?: boolean;
  skipEmails?: boolean;
  sheetName?: string;
  // Legacy flat format
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  hasSolar?: boolean;
  roofType?: string;
  roofOrientation?: string;
  roofAngle?: number;
  annualConsumption?: number;
  preferredDay?: string;
  preferredTime?: string;
}

// Hungarian translations for roof data
const roofTypeLabels: Record<string, string> = {
  flat: "Lapos",
  sheet: "Lemez",
  standing_seam: "Korcolt lemez",
  shingle: "Zsindely",
  tile: "Cserép",
};

const orientationLabels: Record<string, string> = {
  north: "Észak",
  northeast: "Északkelet",
  east: "Kelet",
  southeast: "Délkelet",
  south: "Dél",
  southwest: "Délnyugat",
  west: "Nyugat",
  northwest: "Északnyugat",
};

const preferredDayLabels: Record<string, string> = {
  weekday: "Hétköznap",
  weekend: "Hétvégén",
};

const preferredTimeLabels: Record<string, string> = {
  morning: "Délelőtt",
  afternoon: "Délután",
};

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to escape HTML
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Received notification request:", requestBody);
    
    // Skip emails during testing
    const skipEmails = requestBody.skipEmails === true;
    
    // Support both flat format and nested data format
    const data: NotificationData = requestBody.data || {
      name: requestBody.name,
      phone: requestBody.phone,
      email: requestBody.email,
      address: requestBody.address,
      hasSolar: requestBody.hasSolar,
      inverterBrand: requestBody.inverterBrand,
      roofType: requestBody.roofType,
      roofOrientation: requestBody.roofOrientation,
      roofAngle: requestBody.roofAngle,
      annualConsumption: requestBody.annualConsumption,
      preferredDay: requestBody.preferredDay,
      preferredTime: requestBody.preferredTime,
      notes: requestBody.notes,
      images: requestBody.images,
    };
    const surveyData: SurveyData | undefined = requestBody.surveyData;
    const type = requestBody.type;
    
    // Handle survey type - only send to Google Sheets (Kerdoiv sheet)
    if (type === "survey" && surveyData) {
      console.log("Processing survey submission:", surveyData);
      
      // Extract owners and beneficiaries from request
      const owners: Owner[] = requestBody.owners || [];
      const beneficiaries: Beneficiary[] = requestBody.beneficiaries || [];
      const hasBeneficiaries = requestBody.hasBeneficiaries;
      const groupedData: { categoryName: string; questions: { question: string; answer: string }[] }[] = requestBody.groupedData || [];
      
      let pdfUrl = "";
      
      // Generate real PDF using pdf-lib with category grouping
      try {
        console.log("Generating real PDF for survey with categories...");
        
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        
        // Import pdf-lib
        const { PDFDocument, StandardFonts, rgb } = await import("https://esm.sh/pdf-lib@1.17.1");
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const timestamp = new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
        
        // Helper to sanitize Hungarian characters for PDF
        const sanitizeText = (text: string): string => {
          if (!text) return "";
          return text
            .replace(/á/g, "a").replace(/Á/g, "A")
            .replace(/é/g, "e").replace(/É/g, "E")
            .replace(/í/g, "i").replace(/Í/g, "I")
            .replace(/ó/g, "o").replace(/Ó/g, "O")
            .replace(/ö/g, "o").replace(/Ö/g, "O")
            .replace(/ő/g, "o").replace(/Ő/g, "O")
            .replace(/ú/g, "u").replace(/Ú/g, "U")
            .replace(/ü/g, "u").replace(/Ü/g, "U")
            .replace(/ű/g, "u").replace(/Ű/g, "U");
        };
        
        // Create PDF document
        const pdfDoc = await PDFDocument.create();
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 40;
        const contentWidth = pageWidth - 2 * margin;
        
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;
        
        const greenColor = rgb(0.086, 0.635, 0.224);
        const darkGreen = rgb(0.086, 0.396, 0.204);
        const grayColor = rgb(0.216, 0.255, 0.318);
        const lightGray = rgb(0.42, 0.45, 0.49);
        const bgLight = rgb(0.96, 0.96, 0.96);
        const bgRed = rgb(1.0, 0.9, 0.9);
        const redColor = rgb(0.8, 0.1, 0.1);
        
        // Fields that should have red background in PDF
        const highlightedFields = new Set([
          "Pályázó teljes neve", "Születéskori név", "Anyja leánykori neve",
          "Születési hely", "Születési dátum", "Állandó lakcím",
          "Személyazonosító ig. száma", "Adóazonosító jel", "Pályázó e-mail", "Pályázó telefonszám",
          "Villanyszámla fotók", "Felhasználó teljes neve", "Felhasználó telefonszáma",
          "Felhasználó e-mail címe", "Felhasználási cím", "Helyrajzi szám",
          "Mérőóra gyári száma", "Mérési pont (POD) azonosító", "Felhasználó azonosító",
          "Bankszámlaszám", "Áramerősség 1. fázis", "Áramerősség 2. fázis", "Áramerősség 3. fázis",
          "Mérőóra fénykép", "Eljárási Meghatalmazás", "Megbízólevél", "Térképmásolat",
          "Inverter szériaszáma", "Pályázó fél neve",
        ]);
        
        const addNewPageIfNeeded = (neededHeight: number) => {
          if (y - neededHeight < margin + 40) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
        };
        
        // === HEADER ===
        page.drawText("SparkSolar", {
          x: margin,
          y: y,
          size: 26,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 30;
        
        page.drawText("Kerdoiv kitoltes", {
          x: margin,
          y: y,
          size: 16,
          font: helvetica,
          color: grayColor,
        });
        y -= 18;
        
        page.drawText(`Kitoltes datuma: ${sanitizeText(timestamp)}`, {
          x: margin,
          y: y,
          size: 9,
          font: helvetica,
          color: lightGray,
        });
        y -= 12;
        
        page.drawLine({
          start: { x: margin, y: y },
          end: { x: pageWidth - margin, y: y },
          thickness: 2,
          color: greenColor,
        });
        y -= 25;
        
        // === GROUPED QUESTIONS BY CATEGORY ===
        if (groupedData.length > 0) {
          // Use grouped data for organized display
          for (const group of groupedData) {
            addNewPageIfNeeded(50);
            
            // Category header with background
            page.drawRectangle({
              x: margin,
              y: y - 18,
              width: contentWidth,
              height: 22,
              color: greenColor,
            });
            
            page.drawText(sanitizeText(group.categoryName).substring(0, 60), {
              x: margin + 8,
              y: y - 13,
              size: 11,
              font: helveticaBold,
              color: rgb(1, 1, 1),
            });
            y -= 28;
            
            // Questions in this category
            for (const qa of group.questions) {
              if (!qa.answer || qa.answer.trim() === "") continue;
              
              addNewPageIfNeeded(35);
              
              // Question row
              page.drawRectangle({
                x: margin,
                y: y - 26,
                width: contentWidth,
                height: 28,
                color: bgLight,
              });
              
              // Question label
              const qText = sanitizeText(qa.question).substring(0, 55);
              page.drawText(qText, {
                x: margin + 6,
                y: y - 10,
                size: 8,
                font: helvetica,
                color: lightGray,
              });
              
              // Answer value
              const aText = sanitizeText(qa.answer).substring(0, 60);
              page.drawText(aText, {
                x: margin + 6,
                y: y - 22,
                size: 10,
                font: helveticaBold,
                color: grayColor,
              });
              
              y -= 30;
            }
            
            y -= 8;
          }
        } else {
          // Fallback: use flat surveyData
          page.drawText("Kerdoiv valaszok", {
            x: margin,
            y: y,
            size: 13,
            font: helveticaBold,
            color: darkGreen,
          });
          y -= 20;
          
          Object.entries(surveyData).forEach(([question, answer]) => {
            if (question.startsWith("Tulajdonos ") || question.startsWith("Haszonelvezo ") || 
                question === "Tulajdonosok szama" || question === "Haszonelvezok szama" ||
                question === "Haszonelvezeti joggal terhelt") {
              return;
            }
            
            if (!answer || String(answer).trim() === "") return;
            
            const answerStr = String(answer);
            const isUrl = answerStr.startsWith("http://") || answerStr.startsWith("https://");
            const hasMultipleUrls = isUrl && answerStr.includes(", http");
            
            const isHighlighted = highlightedFields.has(question);
            
            if (isUrl) {
              // Split multiple URLs
              const urls = answerStr.split(", ").filter(u => u.startsWith("http"));
              const maxCharsPerLine = 95;
              // Calculate total lines needed for all URLs
              let totalUrlLines = 0;
              const urlLineData: { lines: string[]; originalUrl: string }[] = [];
              urls.forEach((url) => {
                const fullUrl = sanitizeText(url.trim());
                const lines: string[] = [];
                for (let i = 0; i < fullUrl.length; i += maxCharsPerLine) {
                  lines.push(fullUrl.substring(i, i + maxCharsPerLine));
                }
                urlLineData.push({ lines, originalUrl: url.trim() });
                totalUrlLines += lines.length;
              });
              const rowHeight = 16 + totalUrlLines * 10;
              
              addNewPageIfNeeded(rowHeight + 5);
              
              page.drawRectangle({
                x: margin,
                y: y - rowHeight,
                width: contentWidth,
                height: rowHeight,
                color: isHighlighted ? bgRed : bgLight,
              });
              
              const qText = sanitizeText(question).substring(0, 55);
              page.drawText(qText, {
                x: margin + 6,
                y: y - 10,
                size: 8,
                font: helvetica,
                color: isHighlighted ? redColor : lightGray,
              });
              
              // Render each URL on its own line with smaller font, wrapping if needed
              let lineOffset = 0;
              urlLineData.forEach(({ lines, originalUrl }) => {
                const linkStartY = y - 22 - (lineOffset * 10);
                const linkEndY = linkStartY - (lines.length * 10) + 2;
                
                lines.forEach((line) => {
                  page.drawText(line, {
                    x: margin + 6,
                    y: y - 22 - (lineOffset * 10),
                    size: 6,
                    font: helvetica,
                    color: rgb(0.1, 0.3, 0.7),
                  });
                  lineOffset++;
                });
                
                // Add clickable link annotation for this URL
                try {
                  const linkAnnotation = pdfDoc.context.obj({
                    Type: 'Annot',
                    Subtype: 'Link',
                    Rect: [margin + 6, linkEndY, margin + contentWidth - 6, linkStartY + 8],
                    Border: [0, 0, 0],
                    A: {
                      Type: 'Action',
                      S: 'URI',
                      URI: pdfDoc.context.obj(originalUrl),
                    },
                  });
                  page.node.addAnnot(pdfDoc.context.register(linkAnnotation));
                } catch (annotErr) {
                  console.error("Error adding link annotation:", annotErr);
                }
              });
              
              y -= rowHeight + 4;
            } else {
              addNewPageIfNeeded(35);
              
              page.drawRectangle({
                x: margin,
                y: y - 26,
                width: contentWidth,
                height: 28,
                color: isHighlighted ? bgRed : bgLight,
              });
              
              const qText = sanitizeText(question).substring(0, 55);
              page.drawText(qText, {
                x: margin + 6,
                y: y - 10,
                size: 8,
                font: helvetica,
                color: isHighlighted ? redColor : lightGray,
              });
              
              const aText = sanitizeText(answerStr).substring(0, 60);
              page.drawText(aText, {
                x: margin + 6,
                y: y - 22,
                size: 10,
                font: helveticaBold,
                color: grayColor,
              });
              
              y -= 30;
            }
          });
        }
        
        y -= 15;
        
        // === OWNERS SECTION ===
        if (owners.length > 0) {
          addNewPageIfNeeded(60);
          
          // Section header
          page.drawRectangle({
            x: margin,
            y: y - 18,
            width: contentWidth,
            height: 22,
            color: darkGreen,
          });
          
          page.drawText("Beruhazassal erintett ingatlan tulajdonviszonyai", {
            x: margin + 8,
            y: y - 13,
            size: 11,
            font: helveticaBold,
            color: rgb(1, 1, 1),
          });
          y -= 30;
          
          page.drawText(`Tulajdonosok szama: ${owners.length}`, {
            x: margin + 6,
            y: y - 5,
            size: 9,
            font: helvetica,
            color: lightGray,
          });
          y -= 18;
          
          // Owner details
          owners.forEach((owner, i) => {
            addNewPageIfNeeded(55);
            
            page.drawRectangle({
              x: margin,
              y: y - 48,
              width: contentWidth,
              height: 50,
              color: bgLight,
            });
            
            page.drawText(`${i + 1}. tulajdonos`, {
              x: margin + 6,
              y: y - 10,
              size: 9,
              font: helveticaBold,
              color: darkGreen,
            });
            
            const line1 = `Nev: ${sanitizeText(owner.name)} | Szul. hely: ${sanitizeText(owner.birthPlace)}`;
            page.drawText(line1.substring(0, 70), {
              x: margin + 6,
              y: y - 24,
              size: 8,
              font: helvetica,
              color: grayColor,
            });
            
            const line2 = `Szul. datum: ${sanitizeText(owner.birthDate)} | Anyja neve: ${sanitizeText(owner.motherName)}`;
            page.drawText(line2.substring(0, 70), {
              x: margin + 6,
              y: y - 36,
              size: 8,
              font: helvetica,
              color: grayColor,
            });
            
            page.drawText(`Tulajdoni hanyad: ${sanitizeText(owner.ownershipShare)}`, {
              x: margin + 350,
              y: y - 10,
              size: 9,
              font: helveticaBold,
              color: grayColor,
            });
            
            y -= 55;
          });
          
          y -= 15;
        }
        
        // === BENEFICIARIES SECTION ===
        if (hasBeneficiaries !== undefined) {
          addNewPageIfNeeded(50);
          
          // Section header
          page.drawRectangle({
            x: margin,
            y: y - 18,
            width: contentWidth,
            height: 22,
            color: darkGreen,
          });
          
          page.drawText("Haszonelvezeti jog", {
            x: margin + 8,
            y: y - 13,
            size: 11,
            font: helveticaBold,
            color: rgb(1, 1, 1),
          });
          y -= 30;
          
          page.drawText(`Haszonelvezeti joggal terhelt: ${hasBeneficiaries ? "Igen" : "Nem"}`, {
            x: margin + 6,
            y: y - 5,
            size: 10,
            font: helvetica,
            color: grayColor,
          });
          y -= 20;
          
          if (hasBeneficiaries && beneficiaries.length > 0) {
            page.drawText(`Haszonelvezok szama: ${beneficiaries.length}`, {
              x: margin + 6,
              y: y - 5,
              size: 9,
              font: helvetica,
              color: lightGray,
            });
            y -= 18;
            
            beneficiaries.forEach((b, i) => {
              addNewPageIfNeeded(45);
              
              page.drawRectangle({
                x: margin,
                y: y - 38,
                width: contentWidth,
                height: 40,
                color: bgLight,
              });
              
              page.drawText(`${i + 1}. haszonelvezo`, {
                x: margin + 6,
                y: y - 10,
                size: 9,
                font: helveticaBold,
                color: darkGreen,
              });
              
              const line1 = `Nev: ${sanitizeText(b.name)} | Szul. hely: ${sanitizeText(b.birthPlace)}`;
              page.drawText(line1.substring(0, 70), {
                x: margin + 6,
                y: y - 24,
                size: 8,
                font: helvetica,
                color: grayColor,
              });
              
              const line2 = `Szul. datum: ${sanitizeText(b.birthDate)} | Anyja neve: ${sanitizeText(b.motherName)}`;
              page.drawText(line2.substring(0, 70), {
                x: margin + 6,
                y: y - 36,
                size: 8,
                font: helvetica,
                color: grayColor,
              });
              
              y -= 45;
            });
          }
        }
        
        // === FOOTER ===
        addNewPageIfNeeded(40);
        y -= 15;
        
        page.drawLine({
          start: { x: margin, y: y },
          end: { x: pageWidth - margin, y: y },
          thickness: 0.5,
          color: rgb(0.85, 0.85, 0.85),
        });
        y -= 15;
        
        page.drawText("SparkSolar - Napelemes megoldasok | www.akkumulator-tamogatas.hu", {
          x: pageWidth / 2 - 130,
          y: y,
          size: 10,
          font: helvetica,
          color: lightGray,
        });
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        const fileTimestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileName = `survey-pdfs/kerdoiv-${fileTimestamp}-${randomId}.pdf`;
        
        const { error: uploadError } = await supabase.storage
          .from("quote-images")
          .upload(fileName, pdfBytes, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading PDF:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("quote-images")
            .getPublicUrl(fileName);
          pdfUrl = urlData.publicUrl;
          console.log("Real PDF uploaded successfully:", pdfUrl);
        }
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
      }
      
      try {
      const GOOGLE_APPS_SCRIPT_URL = Deno.env.get("GOOGLE_APPS_SCRIPT_URL") || "";
        
        // Build headers and row data dynamically from survey responses
        const headers: string[] = ["Dátum"];
        const rowData: string[] = [new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })];
        
        // Add all survey question-answer pairs
        Object.entries(surveyData).forEach(([question, answer]) => {
          headers.push(question);
          rowData.push(String(answer));
        });
        
        // Add PDF link at the end
        if (pdfUrl) {
          headers.push("PDF Link");
          rowData.push(pdfUrl);
        }
        
        // Send survey data to Apps Script - keep legacy keys for compatibility
        const surveySheetName = requestBody.sheetName || "Kerdoiv";
        const sheetsPayload = {
          type: "survey",
          sheetName: surveySheetName,
          sheet: surveySheetName,
          targetSheet: surveySheetName,
          tabName: surveySheetName,
          headers: headers,
          rowData: rowData,
          source: "📋 Kérdőív",
          surveySource: `📋 Kérdőív (${surveySheetName})`,
        };

        console.log("Sending survey to Apps Script (Kerdoiv sheet):", sheetsPayload);

        const sheetsResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetsPayload),
        });

        if (sheetsResponse.ok) {
          const result = await sheetsResponse.json();
          console.log("Google Sheets Apps Script response:", result);
        } else {
          const errorText = await sheetsResponse.text();
          console.error("Apps Script error:", sheetsResponse.status, errorText);
        }
      } catch (sheetsError) {
        console.error("Error adding survey to Google Sheets:", sheetsError);
      }

      return new Response(JSON.stringify({ success: true, pdfUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log("Parsed data:", data);
    console.log("hasSolar value:", data.hasSolar);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    let subject: string;
    let htmlContent: string;

    if (type === "callback") {
      const preferredDayText = data.preferredDay ? preferredDayLabels[data.preferredDay] || data.preferredDay : "Nincs megadva";
      const preferredTimeText = data.preferredTime ? preferredTimeLabels[data.preferredTime] || data.preferredTime : "Nincs megadva";
      
      subject = `🔔 Új visszahívás kérés - ${data.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Új visszahívás kérés érkezett!</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ügyfél adatai:</h2>
            <p><strong>Név:</strong> ${data.name}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          </div>
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1e40af;">Visszahívás időpontja:</h2>
            <p><strong>Preferált nap:</strong> ${preferredDayText}</p>
            <p><strong>Preferált napszak:</strong> ${preferredTimeText}</p>
          </div>
          <p style="color: #666;">Kérjük, hívja vissza az ügyfelet mihamarabb!</p>
        </div>
      `;
    } else if (type === "quick_quote") {
      // Quick quote - simpler format with hasSolar info
      const hasSolarText = data.hasSolar ? "Igen (bővítés/karbantartás)" : "Nem";
      const inverterText = data.inverterBrand || "Nincs megadva";
      
      subject = `⚡ Gyors ajánlatkérés - ${data.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Új gyors ajánlatkérés érkezett!</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ügyfél adatai:</h2>
            <p><strong>Név:</strong> ${data.name}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Cím:</strong> ${data.address || "Nincs megadva"}</p>
          </div>
          <div style="background: ${data.hasSolar ? '#dbeafe' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Van már napeleme:</strong> ${hasSolarText}</p>
            ${data.hasSolar ? `<p><strong>Inverter márka:</strong> ${inverterText}</p>` : ''}
            ${data.notes ? `<p><strong>Megjegyzés:</strong> ${data.notes}</p>` : ''}
          </div>
          <p style="color: #666;">Tekintse meg az ajánlatkéréseket az admin felületen!</p>
        </div>
      `;
    } else if (type === "package_select") {
      // Package selection
      const hasSolarText = data.hasSolar ? "Igen" : "Nem";
      const inverterText = data.inverterBrand || "Nincs megadva";
      const packageInfo = data.packageCode ? `${data.packageTitle} (${data.packageCode})` : data.packageTitle;
      const batteryText = data.batterySize || null;
      
      subject = `📦 Csomag kiválasztás - ${data.name} - ${data.packageTitle}${batteryText ? ` - ${batteryText}` : ''}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Új csomag kiválasztás érkezett!</h1>
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h2 style="margin-top: 0; color: #166534;">Kiválasztott csomag:</h2>
            <p style="font-size: 18px; font-weight: bold; color: #166534;">${packageInfo}</p>
            ${batteryText ? `<p style="font-size: 16px; color: #166534;">🔋 <strong>Akkumulátor méret:</strong> ${batteryText}</p>` : ''}
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ügyfél adatai:</h2>
            <p><strong>Név:</strong> ${data.name}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Cím:</strong> ${data.address || "Nincs megadva"}</p>
          </div>
          <div style="background: ${data.hasSolar ? '#dbeafe' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Van már napeleme:</strong> ${hasSolarText}</p>
            ${data.hasSolar ? `<p><strong>Inverter márka:</strong> ${inverterText}</p>` : ''}
            ${data.notes ? `<p><strong>Megjegyzés:</strong> ${data.notes}</p>` : ''}
          </div>
          <p style="color: #666;">Tekintse meg az ajánlatkéréseket az admin felületen!</p>
        </div>
      `;
    } else {
      // Regular quote
      const roofTypeText = data.roofType ? roofTypeLabels[data.roofType] || data.roofType : "Nincs megadva";
      const orientationText = data.roofOrientation ? orientationLabels[data.roofOrientation] || data.roofOrientation : "Nincs megadva";
      const hasSolarText = data.hasSolar ? "Igen (bővítés/karbantartás)" : "Nem";
      
      subject = `☀️ Új ajánlatkérés - ${data.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Új ajánlatkérés érkezett!</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Ügyfél adatai:</h2>
            <p><strong>Név:</strong> ${data.name}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Cím:</strong> ${data.address || "Nincs megadva"}</p>
          </div>
          <div style="background: ${data.hasSolar ? '#dbeafe' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: ${data.hasSolar ? '#1e40af' : '#92400e'};">Napelem információ:</h2>
            <p><strong>Van már napeleme:</strong> ${hasSolarText}</p>
            ${!data.hasSolar ? `
            <p><strong>Tető típusa:</strong> ${roofTypeText}</p>
            <p><strong>Tető tájolása:</strong> ${orientationText}</p>
            <p><strong>Tető dőlésszöge:</strong> ${data.roofAngle !== undefined ? data.roofAngle + "°" : "Nincs megadva"}</p>
            <p><strong>Éves fogyasztás:</strong> ${data.annualConsumption ? data.annualConsumption + " kWh" : "Nincs megadva"}</p>
            ` : ''}
          </div>
          <p style="color: #666;">Tekintse meg az ajánlatkéréseket az admin felületen!</p>
        </div>
      `;
    }

    console.log("Sending admin email to:", ADMIN_EMAILS);

    let adminEmailResponse = null;
    
    if (skipEmails) {
      console.log("SKIP_EMAILS enabled - skipping admin email");
    } else {
      // Send admin notification
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SparkSolar <info@akkumulator-tamogatas.hu>",
          to: ADMIN_EMAILS,
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!adminRes.ok) {
        const errorText = await adminRes.text();
        console.error("Resend API error (admin):", errorText);
        throw new Error(`Failed to send admin email: ${errorText}`);
      }

      adminEmailResponse = await adminRes.json();
      console.log("Admin email sent successfully:", adminEmailResponse);

      // Wait 1.5 seconds to avoid Resend rate limit (2 requests per second)
      console.log("Waiting 1.5s to avoid rate limit...");
      await delay(1500);
    }

    // Send confirmation email to customer
    let customerSubject: string;
    let customerHtmlContent: string;

    if (type === "callback") {
      customerSubject = "Visszahívás kérését megkaptuk - SparkSolar";
      customerHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #16a34a;">
            <img src="https://akkumulator-tamogatas.hu/sparksolar-logo-new.png" alt="SparkSolar Logo" style="max-width: 180px; height: auto;" />
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">Kedves ${data.name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Köszönjük, hogy érdeklődik szolgáltatásaink iránt! Visszahívás kérését sikeresen rögzítettük.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="color: #374151; margin: 0;">
                <strong>Egyik kollégánk hamarosan felveszi Önnel a kapcsolatot a megadott telefonszámon.</strong>
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Ha bármilyen kérdése van addig is, keressen minket bizalommal!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              SparkSolar - Napelemes megoldások<br/>
              <a href="https://akkumulator-tamogatas.hu" style="color: #16a34a;">www.akkumulator-tamogatas.hu</a>
            </p>
          </div>
        </div>
      `;
    } else if (type === "package_select") {
      const packageInfo = data.packageCode ? `${data.packageTitle} (${data.packageCode})` : data.packageTitle;
      customerSubject = `Csomag kiválasztását megkaptuk - SparkSolar`;
      customerHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #16a34a;">
            <img src="https://akkumulator-tamogatas.hu/sparksolar-logo-new.png" alt="SparkSolar Logo" style="max-width: 180px; height: auto;" />
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">Kedves ${data.name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Köszönjük, hogy kiválasztotta a <strong>${packageInfo}</strong> csomagunkat!
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="color: #374151; margin: 0;">
                <strong>Egyik kollégánk hamarosan felveszi Önnel a kapcsolatot és személyre szabott ajánlatot készít a kiválasztott csomagra vonatkozóan.</strong>
              </p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                💡 <strong>Tudta?</strong> A napenergia segítségével akár 80-90%-kal is csökkentheti villanyszámláját!
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Ha bármilyen kérdése van addig is, keressen minket bizalommal!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              SparkSolar - Napelemes megoldások<br/>
              <a href="https://akkumulator-tamogatas.hu" style="color: #16a34a;">www.akkumulator-tamogatas.hu</a>
            </p>
          </div>
        </div>
      `;
    } else {
      customerSubject = "Ajánlatkérését megkaptuk - SparkSolar";
      customerHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #16a34a;">
            <img src="https://akkumulator-tamogatas.hu/sparksolar-logo-new.png" alt="SparkSolar Logo" style="max-width: 180px; height: auto;" />
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">Kedves ${data.name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Köszönjük ajánlatkérését! Megkeresését sikeresen rögzítettük rendszerünkben.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="color: #374151; margin: 0;">
                <strong>Egyik kollégánk hamarosan átnézi az Ön által megadott adatokat és személyre szabott ajánlattal keresni fogja Önt.</strong>
              </p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                💡 <strong>Tudta?</strong> A napenergia segítségével akár 80-90%-kal is csökkentheti villanyszámláját!
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Ha bármilyen kérdése van addig is, keressen minket bizalommal!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              SparkSolar - Napelemes megoldások<br/>
              <a href="https://akkumulator-tamogatas.hu" style="color: #16a34a;">www.akkumulator-tamogatas.hu</a>
            </p>
          </div>
        </div>
      `;
    }

    console.log("Sending customer confirmation email to:", data.email);

    if (skipEmails) {
      console.log("SKIP_EMAILS enabled - skipping customer email");
    } else {
      // Send customer confirmation email
      const customerRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SparkSolar <info@akkumulator-tamogatas.hu>",
          to: [data.email],
          subject: customerSubject,
          html: customerHtmlContent,
        }),
      });

      if (!customerRes.ok) {
        const errorText = await customerRes.text();
        console.error("Resend API error (customer):", errorText);
        // Don't throw here, admin email was already sent
      } else {
        const customerEmailResponse = await customerRes.json();
        console.log("Customer confirmation email sent successfully:", customerEmailResponse);
      }
    }

    // ClickUp integration disabled

    // Create Trello card
    try {
      const TRELLO_API_KEY = Deno.env.get("TRELLO_API_KEY");
      const TRELLO_TOKEN = Deno.env.get("TRELLO_TOKEN");
      const TRELLO_LIST_ID = Deno.env.get("TRELLO_LIST_ID");

      if (TRELLO_API_KEY && TRELLO_TOKEN && TRELLO_LIST_ID) {
        console.log("Creating Trello card for:", type, data.name);
        
        // Build card name based on type
        let cardName = "";
        switch (type) {
          case "quote":
            cardName = `🔆 Árajánlatkérés - ${data.name}`;
            break;
          case "callback":
            cardName = `📞 Visszahívás - ${data.name}`;
            break;
          case "quick_quote":
            cardName = `⚡ Gyors ajánlatkérés - ${data.name}`;
            break;
          case "package_select":
            cardName = `📦 Csomag érdeklődés - ${data.name} (${data.packageTitle || data.packageCode})`;
            break;
          default:
            cardName = `Új érdeklődés - ${data.name}`;
        }

        // Build description
        const trelloDescParts: string[] = [
          `**Név:** ${data.name}`,
          `**Email:** ${data.email}`,
          `**Telefon:** ${data.phone}`,
        ];

        if (data.address) {
          trelloDescParts.push(`**Cím:** ${data.address}`);
        }

        if (data.inverterBrand) {
          trelloDescParts.push(`**Inverter márka:** ${data.inverterBrand}`);
        }

        if (type === "quote" || type === "quick_quote" || type === "package_select") {
          if (data.hasSolar !== undefined) {
            trelloDescParts.push(`**Van napeleme:** ${data.hasSolar ? "Igen" : "Nem"}`);
          }
          if (!data.hasSolar) {
            if (data.roofType) {
              const roofTypeMap: Record<string, string> = {
                flat: "Lapostető",
                sheet: "Trapézlemez",
                standing_seam: "Állókorcos lemez",
                shingle: "Zsindely",
                tile: "Cserép"
              };
              trelloDescParts.push(`**Tető típusa:** ${roofTypeMap[data.roofType] || data.roofType}`);
            }
            if (data.roofAngle !== undefined) {
              trelloDescParts.push(`**Tető dőlésszöge:** ${data.roofAngle}°`);
            }
            if (data.roofOrientation) {
              const orientationMap: Record<string, string> = {
                south: "Dél",
                southeast: "Délkelet",
                southwest: "Délnyugat",
                east: "Kelet",
                west: "Nyugat",
                north: "Észak",
                northeast: "Északkelet",
                northwest: "Északnyugat"
              };
              trelloDescParts.push(`**Tető tájolása:** ${orientationMap[data.roofOrientation] || data.roofOrientation}`);
            }
          }
        }

        if (data.packageTitle) {
          trelloDescParts.push(`**Csomag:** ${data.packageTitle}`);
        }

        if (data.packageCode) {
          trelloDescParts.push(`**Csomag kód:** ${data.packageCode}`);
        }

        if (data.notes) {
          trelloDescParts.push(`\n**Megjegyzés:**\n${data.notes}`);
        }

        if (data.images && data.images.length > 0) {
          trelloDescParts.push(`\n**Csatolt képek:**`);
          data.images.forEach((url, index) => {
            trelloDescParts.push(`- Kép ${index + 1}: ${url}`);
          });
        }

        trelloDescParts.push(`\n---\nBeküldve: ${new Date().toLocaleString("hu-HU")}`);

        const trelloDescription = trelloDescParts.join("\n");

        // Create Trello card
        const trelloUrl = new URL("https://api.trello.com/1/cards");
        trelloUrl.searchParams.append("key", TRELLO_API_KEY);
        trelloUrl.searchParams.append("token", TRELLO_TOKEN);
        trelloUrl.searchParams.append("idList", TRELLO_LIST_ID);
        trelloUrl.searchParams.append("name", cardName);
        trelloUrl.searchParams.append("desc", trelloDescription);
        trelloUrl.searchParams.append("pos", "top"); // Add to top of list

        const trelloResponse = await fetch(trelloUrl.toString(), {
          method: "POST",
          headers: {
            "Accept": "application/json",
          },
        });

        if (!trelloResponse.ok) {
          const errorText = await trelloResponse.text();
          console.error("Trello API error:", trelloResponse.status, errorText);
        } else {
          const trelloResult = await trelloResponse.json();
          console.log("Trello card created successfully:", trelloResult.id);
        }
      } else {
        console.log("Trello not configured, skipping card creation");
      }
    } catch (trelloError) {
      console.error("Error creating Trello card:", trelloError);
      // Don't throw - emails were already sent successfully
    }

    // Add to Google Sheets via Apps Script
    try {
      const GOOGLE_APPS_SCRIPT_URL = Deno.env.get("GOOGLE_APPS_SCRIPT_URL") || "";
      
      console.log("Adding to Google Sheets via Apps Script for:", type, data.name);

      // Prepare data for the sheet
      const hasSolarText = data.hasSolar === undefined ? "" : (data.hasSolar ? "Igen" : "Nem");
      
      // Only include roof details if user doesn't have solar (hasSolar = false)
      // If they have solar, these fields should only show real data if explicitly provided
      const shouldShowRoofDetails = data.hasSolar === false;
      
      const roofTypeText = shouldShowRoofDetails && data.roofType ? (roofTypeLabels[data.roofType] || data.roofType) : "";
      const orientationText = shouldShowRoofDetails && data.roofOrientation ? (orientationLabels[data.roofOrientation] || data.roofOrientation) : "";
      const roofAngleText = shouldShowRoofDetails && data.roofAngle !== undefined ? `${data.roofAngle}°` : "";
      const consumptionText = data.annualConsumption ? `${data.annualConsumption} kWh` : "";
      const preferredDayText = data.preferredDay ? (preferredDayLabels[data.preferredDay] || data.preferredDay) : "";
      const preferredTimeText = data.preferredTime ? (preferredTimeLabels[data.preferredTime] || data.preferredTime) : "";
      const imagesText = data.images && data.images.length > 0 ? data.images.join(", ") : "";

      const typeLabelMap: Record<string, string> = {
        quote: "☀️ Árajánlatkérés",
        callback: "📞 Visszahívás",
        quick_quote: "⚡ Gyors ajánlat",
        package_select: "📦 Csomag érdeklődés"
      };
      const typeLabel = typeLabelMap[type] || type;

      // Package info
      const packageInfo = data.packageCode 
        ? `${data.packageTitle || ""} (${data.packageCode})`
        : (data.packageTitle || "");

      // Send data to Apps Script
      const sheetsPayload = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        notes: data.notes || "",
        hasSolar: hasSolarText,
        inverterBrand: data.inverterBrand || "",
        packageInfo: packageInfo,
        batterySize: data.batterySize || "",
        source: typeLabel,
        roofType: roofTypeText,
        roofOrientation: orientationText,
        roofAngle: roofAngleText,
        annualConsumption: consumptionText,
        preferredDay: preferredDayText,
        preferredTime: preferredTimeText,
        images: imagesText,
      };

      console.log("Sending to Apps Script:", sheetsPayload);

      const sheetsResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sheetsPayload),
      });

      if (sheetsResponse.ok) {
        const result = await sheetsResponse.json();
        console.log("Google Sheets Apps Script response:", result);
      } else {
        const errorText = await sheetsResponse.text();
        console.error("Apps Script error:", sheetsResponse.status, errorText);
      }
    } catch (sheetsError) {
      console.error("Error adding to Google Sheets:", sheetsError);
      // Don't throw - other operations were already successful
    }

    return new Response(JSON.stringify({ success: true, adminEmailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification function:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
