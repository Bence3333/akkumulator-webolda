import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Trash2, FileText } from "lucide-react";

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
}

interface OrderSheetDialogProps {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  onPrint: (items: OrderItem[]) => void;
}

const OrderSheetDialog = ({ open, onClose, items, onPrint }: OrderSheetDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map(i => i.id)));

  // Reset selection when dialog opens
  useMemo(() => {
    if (open) {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  }, [open, items]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  const handlePrint = () => {
    onPrint(selectedItems);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rendelőlap összesítő
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Az alábbi termékekhez tartozik cikkszám. Jelöld be, melyeket szeretnéd a rendelőlapra.
          </p>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nincs cikkszámmal rendelkező termék az árajánlatban.
            </div>
          ) : (
            <div className="border rounded-md max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.size === items.length && items.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Cikkszám</TableHead>
                    <TableHead>Megnevezés</TableHead>
                    <TableHead className="text-right w-[80px]">Darab</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className={!selectedIds.has(item.id) ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            setSelectedIds(prev => {
                              const next = new Set(prev);
                              next.delete(item.id);
                              return next;
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {selectedIds.size} / {items.length} tétel kiválasztva
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Mégse
          </Button>
          <Button onClick={handlePrint} disabled={selectedIds.size === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Rendelőlap nyomtatása
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSheetDialog;
