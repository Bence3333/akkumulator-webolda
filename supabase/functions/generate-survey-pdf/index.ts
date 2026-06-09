import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface PDFRequest {
  surveyData: SurveyData;
  owners?: Owner[];
  beneficiaries?: Beneficiary[];
  hasBeneficiaries?: boolean;
}

// Helper to handle Hungarian characters (basic transliteration for PDF)
function sanitizeText(text: string): string {
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
}

// Wrap text to fit within a given width
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(sanitizeText(testLine), fontSize);
    
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

const generatePDF = async (data: PDFRequest): Promise<Uint8Array> => {
  const { surveyData, owners = [], beneficiaries = [], hasBeneficiaries } = data;
  const timestamp = new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page settings
  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addNewPageIfNeeded = (neededHeight: number) => {
    if (y - neededHeight < margin + 50) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  // Colors
  const greenColor = rgb(0.086, 0.635, 0.224); // #16a34a
  const darkGreen = rgb(0.086, 0.396, 0.204); // #166534
  const grayColor = rgb(0.216, 0.255, 0.318); // #374151
  const lightGray = rgb(0.42, 0.45, 0.49); // #6b7280

  // === HEADER ===
  page.drawText("SparkSolar", {
    x: margin,
    y: y,
    size: 28,
    font: helveticaBold,
    color: greenColor,
  });
  y -= 35;

  page.drawText("Kerdoiv kitoltes", {
    x: margin,
    y: y,
    size: 18,
    font: helvetica,
    color: grayColor,
  });
  y -= 20;

  page.drawText(`Kitoltes datuma: ${sanitizeText(timestamp)}`, {
    x: margin,
    y: y,
    size: 10,
    font: helvetica,
    color: lightGray,
  });
  y -= 15;

  // Header line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: pageWidth - margin, y: y },
    thickness: 2,
    color: greenColor,
  });
  y -= 35;

  // === SURVEY QUESTIONS SECTION ===
  page.drawText("Kerdoiv valaszok", {
    x: margin,
    y: y,
    size: 14,
    font: helveticaBold,
    color: darkGreen,
  });
  y -= 5;

  page.drawLine({
    start: { x: margin, y: y },
    end: { x: margin + 150, y: y },
    thickness: 1,
    color: greenColor,
  });
  y -= 20;

  // Draw survey questions and answers
  Object.entries(surveyData).forEach(([question, answer]) => {
    // Skip owner/beneficiary fields as they're displayed separately
    if (question.startsWith("Tulajdonos ") || question.startsWith("Haszonelvezo ") || 
        question === "Tulajdonosok szama" || question === "Haszonelvezok szama" ||
        question === "Haszonelvezeti joggal terhelt") {
      return;
    }

    const questionLines = wrapText(sanitizeText(question), contentWidth / 2 - 10, helveticaBold, 9);
    const answerLines = wrapText(sanitizeText(String(answer)), contentWidth / 2 - 10, helvetica, 9);
    const totalLines = Math.max(questionLines.length, answerLines.length);
    const rowHeight = totalLines * 12 + 8;

    addNewPageIfNeeded(rowHeight);

    // Draw alternating background
    page.drawRectangle({
      x: margin,
      y: y - rowHeight + 5,
      width: contentWidth,
      height: rowHeight,
      color: rgb(0.98, 0.98, 0.98),
    });

    // Draw question
    let lineY = y;
    questionLines.forEach((line) => {
      page.drawText(line, {
        x: margin + 5,
        y: lineY - 10,
        size: 9,
        font: helveticaBold,
        color: grayColor,
      });
      lineY -= 12;
    });

    // Draw answer
    lineY = y;
    answerLines.forEach((line) => {
      page.drawText(line, {
        x: margin + contentWidth / 2 + 5,
        y: lineY - 10,
        size: 9,
        font: helvetica,
        color: grayColor,
      });
      lineY -= 12;
    });

    y -= rowHeight;
  });

  y -= 20;

  // === OWNERS SECTION ===
  if (owners.length > 0) {
    addNewPageIfNeeded(100);

    page.drawText("Beruhazassal erintett ingatlan tulajdonviszonyai", {
      x: margin,
      y: y,
      size: 14,
      font: helveticaBold,
      color: darkGreen,
    });
    y -= 5;

    page.drawLine({
      start: { x: margin, y: y },
      end: { x: margin + 300, y: y },
      thickness: 1,
      color: greenColor,
    });
    y -= 20;

    page.drawText(`Tovabbi tulajdonosok szama: ${owners.length}`, {
      x: margin,
      y: y,
      size: 10,
      font: helvetica,
      color: lightGray,
    });
    y -= 25;

    // Table header
    const colWidths = [25, 90, 80, 70, 100, 60];
    const headers = ["#", "Nev", "Szul. hely", "Szul. datum", "Anyja neve", "Hanyad"];
    
    addNewPageIfNeeded(25);
    
    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: contentWidth,
      height: 22,
      color: rgb(0.95, 0.95, 0.95),
    });

    let xPos = margin + 5;
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: xPos,
        y: y - 12,
        size: 8,
        font: helveticaBold,
        color: grayColor,
      });
      xPos += colWidths[i];
    });
    y -= 25;

    // Table rows
    owners.forEach((owner, i) => {
      addNewPageIfNeeded(20);
      
      xPos = margin + 5;
      const rowData = [
        `${i + 1}.`,
        sanitizeText(owner.name).substring(0, 15),
        sanitizeText(owner.birthPlace).substring(0, 12),
        sanitizeText(owner.birthDate).substring(0, 10),
        sanitizeText(owner.motherName).substring(0, 15),
        sanitizeText(owner.ownershipShare).substring(0, 8),
      ];

      rowData.forEach((text, j) => {
        page.drawText(text, {
          x: xPos,
          y: y - 10,
          size: 8,
          font: helvetica,
          color: grayColor,
        });
        xPos += colWidths[j];
      });

      y -= 18;
    });

    y -= 20;
  }

  // === BENEFICIARIES SECTION ===
  if (hasBeneficiaries !== undefined) {
    addNewPageIfNeeded(80);

    page.drawText("Haszonelvezeti jog", {
      x: margin,
      y: y,
      size: 14,
      font: helveticaBold,
      color: darkGreen,
    });
    y -= 5;

    page.drawLine({
      start: { x: margin, y: y },
      end: { x: margin + 120, y: y },
      thickness: 1,
      color: greenColor,
    });
    y -= 20;

    page.drawText(`A beruhazassal erintett ingatlan haszonelvezeti joggal terhelt: ${hasBeneficiaries ? "Igen" : "Nem"}`, {
      x: margin,
      y: y,
      size: 10,
      font: helvetica,
      color: grayColor,
    });
    y -= 25;

    if (hasBeneficiaries && beneficiaries.length > 0) {
      page.drawText(`Haszonelvezok szama: ${beneficiaries.length}`, {
        x: margin,
        y: y,
        size: 10,
        font: helvetica,
        color: lightGray,
      });
      y -= 25;

      // Table header
      const colWidths = [25, 110, 100, 90, 130];
      const headers = ["#", "Nev", "Szul. hely", "Szul. datum", "Anyja neve"];
      
      addNewPageIfNeeded(25);
      
      page.drawRectangle({
        x: margin,
        y: y - 18,
        width: contentWidth,
        height: 22,
        color: rgb(0.95, 0.95, 0.95),
      });

      let xPos = margin + 5;
      headers.forEach((header, i) => {
        page.drawText(header, {
          x: xPos,
          y: y - 12,
          size: 8,
          font: helveticaBold,
          color: grayColor,
        });
        xPos += colWidths[i];
      });
      y -= 25;

      // Table rows
      beneficiaries.forEach((beneficiary, i) => {
        addNewPageIfNeeded(20);
        
        xPos = margin + 5;
        const rowData = [
          `${i + 1}.`,
          sanitizeText(beneficiary.name).substring(0, 18),
          sanitizeText(beneficiary.birthPlace).substring(0, 15),
          sanitizeText(beneficiary.birthDate).substring(0, 12),
          sanitizeText(beneficiary.motherName).substring(0, 20),
        ];

        rowData.forEach((text, j) => {
          page.drawText(text, {
            x: xPos,
            y: y - 10,
            size: 8,
            font: helvetica,
            color: grayColor,
          });
          xPos += colWidths[j];
        });

        y -= 18;
      });
    }
  }

  // === FOOTER ===
  addNewPageIfNeeded(50);
  y -= 20;

  page.drawLine({
    start: { x: margin, y: y },
    end: { x: pageWidth - margin, y: y },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  y -= 20;

  page.drawText("SparkSolar - Napelemes megoldasok", {
    x: pageWidth / 2 - 80,
    y: y,
    size: 10,
    font: helvetica,
    color: lightGray,
  });
  y -= 15;

  page.drawText("www.akkumulator-tamogatas.hu", {
    x: pageWidth / 2 - 70,
    y: y,
    size: 10,
    font: helvetica,
    color: lightGray,
  });

  // Serialize PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: PDFRequest = await req.json();
    console.log("Generating real PDF for survey data");

    // Generate PDF bytes
    const pdfBytes = await generatePDF(requestBody);

    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `kerdoiv-${timestamp}-${randomId}.pdf`;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload PDF file to storage
    const { error: uploadError } = await supabase.storage
      .from("quote-images")
      .upload(`survey-pdfs/${fileName}`, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("quote-images")
      .getPublicUrl(`survey-pdfs/${fileName}`);

    const pdfUrl = urlData.publicUrl;
    console.log("PDF uploaded successfully:", pdfUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl,
        message: "PDF generated successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating PDF:", message);
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
