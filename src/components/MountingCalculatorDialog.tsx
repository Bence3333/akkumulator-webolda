import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calculator, Edit2, ShoppingCart, Check, Sun, AlertTriangle } from "lucide-react";
import { QuoteItem } from "@/hooks/useQuoteItems";

// Native select styling class
const nativeSelectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface CalculatedItem {
  id: string;
  quoteItemId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  minQuantity: number;
  subcategory: string;
}

interface TileRow {
  id: string;
  panelCount: number;
}

interface MetalRow {
  id: string;
  panelCount: number;
}

interface FlatRow {
  id: string;
  panelCount: number;
  rowCount: number;
  shadowDistance: number;
}

interface RailMarginWarning {
  neededLengthMm: number;
  railLengthMm: number;
  marginMm: number;
}

interface MountingCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  onAddItems: (items: CalculatedItem[]) => void;
  quoteItems: QuoteItem[];
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Parse rail length from name (e.g., "ERK szerelősín 4,2m" -> 4.2)
const parseRailLengthFromName = (name: string): number => {
  // First check for mm format like "Mountkit sín 2800mm"
  const mmMatch = name.match(/(\d+)\s*mm/i);
  if (mmMatch) {
    return parseInt(mmMatch[1]) / 1000;
  }
  // Then check for m format like "ERK szerelősín 4,2m" (but not mm)
  const match = name.match(/(\d+[,.]?\d*)\s*m(?!m)/i);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return 0;
};

// Cseréptetőhöz: mindig 3.5m-es sínnel számolunk, teljes hossz / 3.5 felfelé kerekítve
const calculateTileRailCount = (targetLengthM: number): number => {
  if (targetLengthM <= 0) return 0;
  return Math.ceil(targetLengthM / 3.5);
};

// Lapostetőhöz: csak 2800mm és 1400mm sínek
// Ha elég a 2800 egyedül, azt használjuk
// Ha több kell, kombináljuk: 2800 + 1400, és toldó kell közéjük
const calculateFlatRoofRails = (
  neededLengthMm: number,
  rail2800: { id: string; name: string; lengthM: number; unitPrice: number; minQuantity: number } | undefined,
  rail1400: { id: string; name: string; lengthM: number; unitPrice: number; minQuantity: number } | undefined
): { 
  rail2800Count: number; 
  rail1400Count: number; 
  needsConnector: boolean;
  rubberFeet: number;
  marginMm: number;
  totalRailLengthMm: number;
} => {
  if (!rail2800 && !rail1400) return { rail2800Count: 0, rail1400Count: 0, needsConnector: false, rubberFeet: 0, marginMm: 0, totalRailLengthMm: 0 };
  
  // Ha 1400mm elég egyedül (pl. 1 sorba rakva a paneleket)
  if (rail1400 && neededLengthMm <= 1400) {
    return {
      rail2800Count: 0,
      rail1400Count: 1,
      needsConnector: false,
      rubberFeet: 2, // 1400mm < 2m -> 2 gumitalp
      marginMm: 1400 - neededLengthMm,
      totalRailLengthMm: 1400,
    };
  }
  
  // Ha 2800mm elég egyedül
  if (rail2800 && neededLengthMm <= 2800) {
    return {
      rail2800Count: 1,
      rail1400Count: 0,
      needsConnector: false,
      rubberFeet: 4, // 2800mm -> 4 gumitalp
      marginMm: 2800 - neededLengthMm,
      totalRailLengthMm: 2800,
    };
  }
  
  // Kombinálni kell: 2800 + 1400 = 4200mm
  const totalRailLengthMm = 2800 + 1400;
  return {
    rail2800Count: rail2800 ? 1 : 0,
    rail1400Count: rail1400 ? 1 : 0,
    needsConnector: true,
    rubberFeet: (rail2800 ? 4 : 0) + (rail1400 ? 2 : 0), // 2800: 4db, 1400: 2db
    marginMm: totalRailLengthMm - neededLengthMm,
    totalRailLengthMm,
  };
};

const calculateConnectors = (railCombination: { count: number }[]): number => {
  const totalRailsPerSide = railCombination.reduce((sum, r) => sum + r.count, 0);
  const connectorsPerSide = Math.max(0, totalRailsPerSide - 1);
  return connectorsPerSide * 2;
};

const MountingCalculatorDialog = ({
  open,
  onClose,
  onAddItems,
  quoteItems,
}: MountingCalculatorDialogProps) => {
  const [roofType, setRoofType] = useState<"cserep" | "lemez" | "laposteto">("cserep");
  const [editMode, setEditMode] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  
  // Selected panel
  const [selectedPanelId, setSelectedPanelId] = useState<string>("");
  
  // Tile (Cserép) state
  const [tileRows, setTileRows] = useState<TileRow[]>([{ id: "1", panelCount: 10 }]);
  const [clampWidth, setClampWidth] = useState(35);
  const [selectedRoofHookId, setSelectedRoofHookId] = useState<string>("");
  
  // Metal sheet (Lemez) state
  const [metalRows, setMetalRows] = useState<MetalRow[]>([{ id: "1", panelCount: 10 }]);
  
  // Flat roof state
  const [flatRows, setFlatRows] = useState<FlatRow[]>([{ id: "1", panelCount: 10, rowCount: 2, shadowDistance: 500 }]);
  
  // Get solar panels
  const solarPanels = useMemo(() => 
    quoteItems.filter(item => item.category === 'napelem'),
    [quoteItems]
  );
  
  const selectedPanel = useMemo(() => 
    solarPanels.find(p => p.id === selectedPanelId),
    [solarPanels, selectedPanelId]
  );
  
  const panelWidthMm = selectedPanel?.width_mm || 0;
  const panelHeightMm = selectedPanel?.height_mm || 0;
  
  const getItemsBySubcategory = (subcategory: string) => {
    return quoteItems.filter(item => item.subcategory === subcategory);
  };
  
  const tileRails = useMemo(() => {
    return getItemsBySubcategory("cserep_sin").map(item => ({
      id: item.id,
      name: item.name,
      lengthM: parseRailLengthFromName(item.name),
      unitPrice: item.unit_price,
      minQuantity: item.min_quantity,
    })).filter(r => r.lengthM > 0);
  }, [quoteItems]);
  
  const flatRails = useMemo(() => {
    return getItemsBySubcategory("laposteto_sin").map(item => ({
      id: item.id,
      name: item.name,
      lengthM: parseRailLengthFromName(item.name),
      unitPrice: item.unit_price,
      minQuantity: item.min_quantity,
    })).filter(r => r.lengthM > 0);
  }, [quoteItems]);
  
  // Calculate tile roof items - now using panel count
  const tileCalculation = useMemo(() => {
    const items: CalculatedItem[] = [];
    if (!panelWidthMm) return { items, totalRailLength: 0, totalRoofHooks: 0, totalConnectors: 0, totalIntermediateClamps: 0, totalEndClamps: 0 };
    
    let totalRailLength = 0;
    let totalRoofHooks = 0;
    let totalConnectors = 0;
    let totalIntermediateClamps = 0;
    let totalEndClamps = 0;
    
    for (const row of tileRows) {
      // Calculate rail length from panel count
      const railLengthMm = (row.panelCount * panelWidthMm) + (clampWidth * (row.panelCount - 1));
      const railLengthM = railLengthMm / 1000;
      const railLengthWithMargin = railLengthM * 1.1;
      totalRailLength += railLengthWithMargin * 2;
      
      // Roof hooks = rail length / 1.2 * 1.1
      const roofHooks = Math.ceil((railLengthM / 1.2) * 1.1);
      totalRoofHooks += roofHooks * 2;
      
      // Cserépnél mindig 3.5m-es sín: teljes hossz / 3.5, felfelé kerekítve, mindkét oldalon
      const railCount = calculateTileRailCount(railLengthWithMargin);
      totalRoofHooks += 0; // Already counted above
      
      // Toldók: ha több mint 1 sín kell egy oldalon, kell toldó
      const connectorsPerSide = Math.max(0, railCount - 1);
      totalConnectors += connectorsPerSide * 2;
      
      totalIntermediateClamps += (row.panelCount - 1) * 2;
      totalEndClamps += 2 * 2;
    }
    
    // Sínek száma: mindig 3.5m-es sínekkel számolunk
    const totalRailCount = calculateTileRailCount(totalRailLength);
    
    // Keressük meg a 3.5m-es sínt
    const rail35m = tileRails.find(r => Math.abs(r.lengthM - 3.5) < 0.1) || tileRails[0];
    if (rail35m) {
      items.push({
        id: generateId(),
        quoteItemId: rail35m.id,
        name: rail35m.name,
        quantity: totalRailCount,
        unitPrice: Math.round(rail35m.unitPrice),
        minQuantity: rail35m.minQuantity,
        subcategory: "cserep_sin",
      });
    }
    
    const roofHookItems = getItemsBySubcategory("cserep_tetokampo");
    // Alapértelmezetten fix T01-es kampó, vagy a kiválasztott
    const defaultHook = roofHookItems.find(h => h.name.toLowerCase().includes("fix t01")) || roofHookItems[0];
    const selectedHook = selectedRoofHookId 
      ? roofHookItems.find(h => h.id === selectedRoofHookId) || defaultHook
      : defaultHook;
    
    if (selectedHook) {
      items.push({
        id: generateId(),
        quoteItemId: selectedHook.id,
        name: selectedHook.name,
        quantity: totalRoofHooks,
        unitPrice: Math.round(Number(selectedHook.unit_price)),
        minQuantity: selectedHook.min_quantity,
        subcategory: "cserep_tetokampo",
      });
    }
    
    const connectorItems = getItemsBySubcategory("cserep_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("toldó") || i.name.toLowerCase().includes("síntoldó")
    );
    if (connectorItems.length > 0 && totalConnectors > 0) {
      const connItem = connectorItems[0];
      items.push({
        id: generateId(),
        quoteItemId: connItem.id,
        name: connItem.name,
        quantity: totalConnectors,
        unitPrice: Math.round(Number(connItem.unit_price)),
        minQuantity: connItem.min_quantity,
        subcategory: "cserep_kiegeszito",
      });
    }
    
    const intermediateClampItems = getItemsBySubcategory("cserep_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("köztes")
    );
    if (intermediateClampItems.length > 0 && totalIntermediateClamps > 0) {
      const clampItem = intermediateClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalIntermediateClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "cserep_kiegeszito",
      });
    }
    
    const endClampItems = getItemsBySubcategory("cserep_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("vég")
    );
    if (endClampItems.length > 0 && totalEndClamps > 0) {
      const clampItem = endClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalEndClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "cserep_kiegeszito",
      });
    }
    
    return { items, totalRailLength, totalRoofHooks, totalConnectors, totalIntermediateClamps, totalEndClamps };
  }, [tileRows, tileRails, quoteItems, panelWidthMm, clampWidth, selectedRoofHookId]);
  
  // Calculate metal sheet items
  const metalCalculation = useMemo(() => {
    const items: CalculatedItem[] = [];
    let totalPanels = 0;
    let totalMiniRails = 0;
    let totalIntermediateClamps = 0;
    let totalEndClamps = 0;
    
    for (const row of metalRows) {
      totalPanels += row.panelCount;
      totalMiniRails += (row.panelCount + 1) * 2; // Both sides
      totalIntermediateClamps += (row.panelCount - 1) * 2;
      totalEndClamps += 2 * 2;
    }
    
    const miniRailItems = getItemsBySubcategory("lemez_sin");
    if (miniRailItems.length > 0) {
      const railItem = miniRailItems[0];
      items.push({
        id: generateId(),
        quoteItemId: railItem.id,
        name: railItem.name,
        quantity: totalMiniRails,
        unitPrice: Math.round(Number(railItem.unit_price)),
        minQuantity: railItem.min_quantity,
        subcategory: "lemez_sin",
      });
    }
    
    const intermediateClampItems = getItemsBySubcategory("lemez_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("köztes")
    );
    if (intermediateClampItems.length > 0 && totalIntermediateClamps > 0) {
      const clampItem = intermediateClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalIntermediateClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "lemez_kiegeszito",
      });
    }
    
    const endClampItems = getItemsBySubcategory("lemez_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("vég")
    );
    if (endClampItems.length > 0 && totalEndClamps > 0) {
      const clampItem = endClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalEndClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "lemez_kiegeszito",
      });
    }
    
    return { items, totalPanels, totalMiniRails, totalIntermediateClamps, totalEndClamps };
  }, [metalRows, quoteItems]);
  
  // Calculate flat roof items - using only 2800mm and 1400mm rails
  const flatCalculation = useMemo(() => {
    const items: CalculatedItem[] = [];
    const marginWarnings: RailMarginWarning[] = [];
    if (!panelWidthMm || !panelHeightMm) return { items, totalPanels: 0, totalFrontLegs: 0, totalRearLegs: 0, totalWindDeflectors: 0, totalBallastTrays: 0, totalBallastPavers: 0, totalIntermediateClamps: 0, totalEndClamps: 0, totalRubberFeet: 0, marginWarnings };
    
    let totalPanels = 0;
    let totalFrontLegs = 0;
    let totalRearLegs = 0;
    let totalWindDeflectors = 0;
    let totalBallastTrays = 0;
    let totalBallastPavers = 0;
    let totalIntermediateClamps = 0;
    let totalEndClamps = 0;
    let totalRubberFeet = 0;
    let total2800Rails = 0;
    let total1400Rails = 0;
    let totalConnectors = 0;
    
    // Keressük meg a 2800mm és 1400mm síneket
    const rail2800 = flatRails.find(r => r.name.includes('2800'));
    const rail1400 = flatRails.find(r => r.name.includes('1400'));
    
    // Szélterelő - legalább akkora mint a panel magassága (mm-ben számolunk a pontosság miatt)
    const deflectorItems = getItemsBySubcategory("laposteto_kiegeszito")
      .filter(i => i.name.toLowerCase().includes("szélterelő"))
      .map(item => {
        // Parse mm from name (e.g., "Mountkit szélterelő 2000mm" -> 2000)
        const mmMatch = item.name.match(/(\d+)\s*mm/i);
        const lengthMm = mmMatch ? parseInt(mmMatch[1]) : 0;
        return {
          id: item.id,
          name: item.name,
          lengthMm,
          unitPrice: item.unit_price,
          minQuantity: item.min_quantity,
        };
      })
      .filter(r => r.lengthMm > 0);
    
    // Keressük a legkisebb szélterelőt ami >= panel magassága, ha nincs ilyen, a legnagyobbat
    const suitableDeflector = deflectorItems
      .filter(r => r.lengthMm >= panelHeightMm)
      .sort((a, b) => a.lengthMm - b.lengthMm)[0] || deflectorItems.sort((a, b) => b.lengthMm - a.lengthMm)[0];
    
    for (const row of flatRows) {
      totalPanels += row.panelCount;
      
      // Sín hossz: (panel szélessége * sorok) + (árnyéktávolság * (sorok - 1)) - NEM adunk hozzá ráhagyást
      const neededLengthMm = (panelWidthMm * row.rowCount) + (row.shadowDistance * (row.rowCount - 1));
      
      // Sínválasztás: csak 2800mm és 1400mm
      const railCalc = calculateFlatRoofRails(neededLengthMm, rail2800, rail1400);
      
      // Figyelmeztetés mentése a maradékról
      if (railCalc.marginMm > 0 && railCalc.marginMm <= 150) {
        marginWarnings.push({
          neededLengthMm,
          railLengthMm: railCalc.totalRailLengthMm,
          marginMm: railCalc.marginMm,
        });
      }
      
      // Sínek szorzója: (panelek száma / sor) + 1
      const railMultiplier = Math.floor(row.panelCount / row.rowCount) + 1;
      
      total2800Rails += railCalc.rail2800Count * railMultiplier;
      total1400Rails += railCalc.rail1400Count * railMultiplier;
      totalRubberFeet += railCalc.rubberFeet * railMultiplier;
      
      if (railCalc.needsConnector) {
        totalConnectors += railMultiplier;
      }
      
      // Hátsó láb = panelek + 2, első láb = hátsó lábbal megegyező
      totalRearLegs += row.panelCount + 2;
      totalFrontLegs += row.panelCount + 2;
      totalWindDeflectors += row.panelCount;
      // Ballaszt tálca = hátsó lábak * 2
      totalBallastTrays += (row.panelCount + 2) * 2;
      totalBallastPavers += Math.ceil((row.panelCount + 2) * 1.5);
      
      totalIntermediateClamps += (row.panelCount - 1) * 2;
      totalEndClamps += 2 * 2;
    }
    
    // Sínek hozzáadása
    if (rail2800 && total2800Rails > 0) {
      items.push({
        id: generateId(),
        quoteItemId: rail2800.id,
        name: rail2800.name,
        quantity: total2800Rails,
        unitPrice: Math.round(rail2800.unitPrice),
        minQuantity: rail2800.minQuantity,
        subcategory: "laposteto_sin",
      });
    }
    
    if (rail1400 && total1400Rails > 0) {
      items.push({
        id: generateId(),
        quoteItemId: rail1400.id,
        name: rail1400.name,
        quantity: total1400Rails,
        unitPrice: Math.round(rail1400.unitPrice),
        minQuantity: rail1400.minQuantity,
        subcategory: "laposteto_sin",
      });
    }
    
    const frontLegItems = getItemsBySubcategory("laposteto_lab").filter(i => 
      i.name.toLowerCase().includes("első") && !i.name.toLowerCase().includes("segéd")
    );
    if (frontLegItems.length > 0) {
      const legItem = frontLegItems[0];
      items.push({
        id: generateId(),
        quoteItemId: legItem.id,
        name: legItem.name,
        quantity: totalFrontLegs,
        unitPrice: Math.round(Number(legItem.unit_price)),
        minQuantity: legItem.min_quantity,
        subcategory: "laposteto_lab",
      });
    }
    
    const rearLegItems = getItemsBySubcategory("laposteto_lab").filter(i => 
      i.name.toLowerCase().includes("hátsó") && !i.name.toLowerCase().includes("segéd")
    );
    if (rearLegItems.length > 0) {
      const legItem = rearLegItems[0];
      items.push({
        id: generateId(),
        quoteItemId: legItem.id,
        name: legItem.name,
        quantity: totalRearLegs,
        unitPrice: Math.round(Number(legItem.unit_price)),
        minQuantity: legItem.min_quantity,
        subcategory: "laposteto_lab",
      });
    }
    
    // Szélterelő - megfelelő méretű a panel magassága alapján
    if (suitableDeflector && totalWindDeflectors > 0) {
      items.push({
        id: generateId(),
        quoteItemId: suitableDeflector.id,
        name: suitableDeflector.name,
        quantity: totalWindDeflectors,
        unitPrice: Math.round(suitableDeflector.unitPrice),
        minQuantity: suitableDeflector.minQuantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    const ballastItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("ballaszt") && i.name.toLowerCase().includes("tálca")
    );
    if (ballastItems.length > 0) {
      const ballastItem = ballastItems[0];
      items.push({
        id: generateId(),
        quoteItemId: ballastItem.id,
        name: ballastItem.name,
        quantity: totalBallastTrays,
        unitPrice: Math.round(Number(ballastItem.unit_price)),
        minQuantity: ballastItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    // Ballaszt beton járólap: (panelek + 1) * 1.5
    const paverItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("járólap") || (i.name.toLowerCase().includes("beton") && i.name.toLowerCase().includes("ballaszt"))
    );
    if (paverItems.length > 0 && totalBallastPavers > 0) {
      const paverItem = paverItems[0];
      items.push({
        id: generateId(),
        quoteItemId: paverItem.id,
        name: paverItem.name,
        quantity: totalBallastPavers,
        unitPrice: Math.round(Number(paverItem.unit_price)),
        minQuantity: paverItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    // Gumitalp
    const rubberFeetItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("gumitalp") || i.name.toLowerCase().includes("gumiláb") || i.name.toLowerCase() === "gumitalp"
    );
    if (rubberFeetItems.length > 0 && totalRubberFeet > 0) {
      const feetItem = rubberFeetItems[0];
      items.push({
        id: generateId(),
        quoteItemId: feetItem.id,
        name: feetItem.name,
        quantity: totalRubberFeet,
        unitPrice: Math.round(Number(feetItem.unit_price)),
        minQuantity: feetItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    // Toldó a sínek közé
    const connectorItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("toldó") || i.name.toLowerCase().includes("síntoldó")
    );
    if (connectorItems.length > 0 && totalConnectors > 0) {
      const connItem = connectorItems[0];
      items.push({
        id: generateId(),
        quoteItemId: connItem.id,
        name: connItem.name,
        quantity: totalConnectors,
        unitPrice: Math.round(Number(connItem.unit_price)),
        minQuantity: connItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    const intermediateClampItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("köztes")
    );
    if (intermediateClampItems.length > 0 && totalIntermediateClamps > 0) {
      const clampItem = intermediateClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalIntermediateClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    const endClampItems = getItemsBySubcategory("laposteto_kiegeszito").filter(i => 
      i.name.toLowerCase().includes("végleszorító")
    );
    if (endClampItems.length > 0 && totalEndClamps > 0) {
      const clampItem = endClampItems[0];
      items.push({
        id: generateId(),
        quoteItemId: clampItem.id,
        name: clampItem.name,
        quantity: totalEndClamps,
        unitPrice: Math.round(Number(clampItem.unit_price)),
        minQuantity: clampItem.min_quantity,
        subcategory: "laposteto_kiegeszito",
      });
    }
    
    return { items, totalPanels, totalFrontLegs, totalRearLegs, totalWindDeflectors, totalBallastTrays, totalBallastPavers, totalIntermediateClamps, totalEndClamps, totalRubberFeet, totalConnectors, marginWarnings };
  }, [flatRows, flatRails, quoteItems, panelWidthMm, panelHeightMm]);
  
  const currentItems = useMemo(() => {
    switch (roofType) {
      case "cserep": return tileCalculation.items;
      case "lemez": return metalCalculation.items;
      case "laposteto": return flatCalculation.items;
      default: return [];
    }
  }, [roofType, tileCalculation, metalCalculation, flatCalculation]);
  
  const finalItems = useMemo(() => {
    return currentItems.map(item => ({
      ...item,
      quantity: editedQuantities[item.id] ?? item.quantity,
    }));
  }, [currentItems, editedQuantities]);
  
  const handleAddToQuote = () => {
    onAddItems(finalItems);
    onClose();
  };
  
  const formatPrice = (price: number) => `${price.toLocaleString('hu-HU')} Ft`;
  
  const addTileRow = () => setTileRows(prev => [...prev, { id: generateId(), panelCount: 10 }]);
  const removeTileRow = (id: string) => tileRows.length > 1 && setTileRows(prev => prev.filter(r => r.id !== id));
  const updateTileRow = (id: string, panelCount: number) => setTileRows(prev => prev.map(r => r.id === id ? { ...r, panelCount } : r));
  
  const addMetalRow = () => setMetalRows(prev => [...prev, { id: generateId(), panelCount: 10 }]);
  const removeMetalRow = (id: string) => metalRows.length > 1 && setMetalRows(prev => prev.filter(r => r.id !== id));
  const updateMetalRow = (id: string, panelCount: number) => setMetalRows(prev => prev.map(r => r.id === id ? { ...r, panelCount } : r));
  
  const addFlatRow = () => setFlatRows(prev => [...prev, { id: generateId(), panelCount: 10, rowCount: 2, shadowDistance: 500 }]);
  const removeFlatRow = (id: string) => flatRows.length > 1 && setFlatRows(prev => prev.filter(r => r.id !== id));
  const updateFlatRow = (id: string, updates: Partial<FlatRow>) => setFlatRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  
  const isPanelRequired = roofType === "cserep" || roofType === "laposteto";
  const canCalculate = !isPanelRequired || selectedPanelId;
  
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Tartószerkezet kalkulátor
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto px-6">
          <div className="space-y-4 py-4">
            {/* Panel Selection - required for tile and flat roof */}
            {isPanelRequired && (
              <Card className="border-primary/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    Napelem kiválasztása
                    <Badge variant="destructive" className="text-xs">Kötelező</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Using native select to avoid Radix portal conflicts inside Dialog */}
                  <select
                    value={selectedPanelId}
                    onChange={(e) => setSelectedPanelId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Válassz napelemet...</option>
                    {solarPanels.map(panel => (
                      <option key={panel.id} value={panel.id}>
                        {panel.name}
                      </option>
                    ))}
                  </select>
                  
                  {selectedPanel && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm mb-2">{selectedPanel.name}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Szélesség:</span>
                          <p className="font-mono font-semibold text-primary">{panelWidthMm} mm</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Magasság:</span>
                          <p className="font-mono font-semibold text-primary">{panelHeightMm} mm</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!selectedPanel && solarPanels.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nincs napelem a rendszerben. Add hozzá a Termékek oldalon.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Roof Type Selection */}
            <Tabs value={roofType} onValueChange={(v) => setRoofType(v as typeof roofType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cserep">Cserép</TabsTrigger>
                <TabsTrigger value="lemez">Lemez</TabsTrigger>
                <TabsTrigger value="laposteto">Lapostető</TabsTrigger>
              </TabsList>

              {/* Tile Roof Configuration */}
              <TabsContent value="cserep" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Beállítások</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label className="text-xs">Leszorító szélesség (mm)</Label>
                        <Input
                          type="number"
                          value={clampWidth}
                          onChange={(e) => setClampWidth(Number(e.target.value))}
                          min={30}
                          max={40}
                          className="h-9 w-32"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm">Sorok</CardTitle>
                      <Button variant="outline" size="sm" onClick={addTileRow}>
                        <Plus className="h-3 w-3 mr-1" />
                        Új sor
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sor</TableHead>
                            <TableHead className="text-center">Panelek száma</TableHead>
                            <TableHead className="text-right">Sín hossz</TableHead>
                            <TableHead className="text-right">Tetőkampók</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tileRows.map((row, idx) => {
                            const railLengthMm = panelWidthMm ? (row.panelCount * panelWidthMm) + (clampWidth * (row.panelCount - 1)) : 0;
                            const railLengthM = railLengthMm / 1000;
                            const railLengthTotal = railLengthM * 2; // Both sides
                            const hooks = Math.ceil((railLengthM / 1.2) * 1.1) * 2;
                            return (
                              <TableRow key={row.id}>
                                <TableCell>{idx + 1}. sor</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    value={row.panelCount}
                                    onChange={(e) => updateTileRow(row.id, Number(e.target.value))}
                                    min={1}
                                    className="w-20 h-8 text-center mx-auto"
                                    disabled={!selectedPanelId}
                                  />
                                </TableCell>
                                <TableCell className="text-right font-mono">{railLengthTotal.toFixed(2)} m</TableCell>
                                <TableCell className="text-right font-mono">{hooks} db</TableCell>
                                <TableCell>
                                  {tileRows.length > 1 && (
                                    <Button variant="ghost" size="sm" onClick={() => removeTileRow(row.id)} className="text-destructive h-8 w-8 p-0">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
              </TabsContent>
              
              {/* Metal Sheet Configuration */}
              <TabsContent value="lemez" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm">Sorok</CardTitle>
                      <Button variant="outline" size="sm" onClick={addMetalRow}>
                        <Plus className="h-3 w-3 mr-1" />
                        Új sor
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sor</TableHead>
                            <TableHead className="text-center">Panelek száma</TableHead>
                            <TableHead className="text-right">Minisín db</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {metalRows.map((row, idx) => (
                            <TableRow key={row.id}>
                              <TableCell>{idx + 1}. sor</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={row.panelCount}
                                  onChange={(e) => updateMetalRow(row.id, Number(e.target.value))}
                                  min={1}
                                  className="w-20 h-8 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-right font-mono">{(row.panelCount + 1) * 2} db</TableCell>
                              <TableCell>
                                {metalRows.length > 1 && (
                                  <Button variant="ghost" size="sm" onClick={() => removeMetalRow(row.id)} className="text-destructive h-8 w-8 p-0">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
              </TabsContent>
              
              {/* Flat Roof Configuration */}
              <TabsContent value="laposteto" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm">Sorok</CardTitle>
                      <Button variant="outline" size="sm" onClick={addFlatRow}>
                        <Plus className="h-3 w-3 mr-1" />
                        Új sor
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sor</TableHead>
                            <TableHead className="text-center">Panelek</TableHead>
                            <TableHead className="text-center">Sorok sz.</TableHead>
                            <TableHead className="text-center">Árnyék táv. (mm)</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flatRows.map((row, idx) => (
                            <TableRow key={row.id}>
                              <TableCell>{idx + 1}. sor</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={row.panelCount}
                                  onChange={(e) => updateFlatRow(row.id, { panelCount: Number(e.target.value) })}
                                  min={1}
                                  className="w-16 h-8 text-center mx-auto"
                                  disabled={!selectedPanelId}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={row.rowCount}
                                  onChange={(e) => updateFlatRow(row.id, { rowCount: Number(e.target.value) })}
                                  min={1}
                                  className="w-16 h-8 text-center mx-auto"
                                  disabled={!selectedPanelId}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={row.shadowDistance}
                                  onChange={(e) => updateFlatRow(row.id, { shadowDistance: Number(e.target.value) })}
                                  min={0}
                                  step={100}
                                  className="w-20 h-8 text-center mx-auto"
                                  disabled={!selectedPanelId}
                                />
                              </TableCell>
                              <TableCell>
                                {flatRows.length > 1 && (
                                  <Button variant="ghost" size="sm" onClick={() => removeFlatRow(row.id)} className="text-destructive h-8 w-8 p-0">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  
                  {/* Rail Margin Warning */}
                  {flatCalculation.marginWarnings && flatCalculation.marginWarnings.length > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-600 dark:text-orange-400">Figyelem - szoros sín illeszkedés!</p>
                        {flatCalculation.marginWarnings.map((warning, idx) => (
                          <p key={idx} className="text-muted-foreground">
                            Szükséges: {warning.neededLengthMm}mm → Sín: {warning.railLengthMm}mm = 
                            <span className="font-semibold text-orange-600 dark:text-orange-400"> csak {warning.marginMm}mm maradt szabadon</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
              </TabsContent>
            </Tabs>
            
            {/* Summary */}
            {canCalculate && finalItems.length > 0 && (
              <Card className="bg-muted/50">
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Összesítés
                  </CardTitle>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? <Check className="h-3 w-3 mr-1" /> : <Edit2 className="h-3 w-3 mr-1" />}
                    {editMode ? "Kész" : "Szerkesztés"}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tétel</TableHead>
                        <TableHead className="text-center w-24">Mennyiség</TableHead>
                        <TableHead className="text-right">Egységár</TableHead>
                        <TableHead className="text-right">Összesen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finalItems.map(item => {
                        const isRoofHook = item.subcategory === 'cserep_tetokampo' && roofType === 'cserep';
                        const roofHookOptions = isRoofHook 
                          ? quoteItems.filter(qi => qi.subcategory === 'cserep_tetokampo')
                          : [];
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                {isRoofHook ? (
                                  <select
                                    value={selectedRoofHookId || (roofHookOptions.find(h => h.name.toLowerCase().includes("fix t01"))?.id || roofHookOptions[0]?.id || '')}
                                    onChange={(e) => setSelectedRoofHookId(e.target.value)}
                                    className="font-medium text-sm bg-transparent border-none cursor-pointer hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 -ml-1"
                                  >
                                    {roofHookOptions.map(hook => (
                                      <option key={hook.id} value={hook.id}>
                                        {hook.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <p className="font-medium text-sm">{item.name}</p>
                                )}
                                {item.minQuantity > 1 && (
                                  <Badge variant="outline" className="text-xs mt-1">min {item.minQuantity} db</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {editMode ? (
                                <Input
                                  type="number"
                                  value={editedQuantities[item.id] ?? item.quantity}
                                  onChange={(e) => setEditedQuantities(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                  min={0}
                                  className="w-20 h-8 text-center mx-auto"
                                />
                              ) : (
                                <span className="font-mono">{item.quantity} db</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatPrice(Math.round(item.unitPrice / item.minQuantity))}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              {formatPrice(Math.round((item.unitPrice / item.minQuantity) * item.quantity))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            {!canCalculate && isPanelRequired && (
              <div className="text-center py-8 text-muted-foreground">
                <Sun className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Válassz ki egy napelemet a számításhoz</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Mégse</Button>
          <Button onClick={handleAddToQuote} disabled={!canCalculate || finalItems.length === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Hozzáadás az árajánlathoz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MountingCalculatorDialog;
