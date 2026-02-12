"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePageHeader } from "@/contexts/page-header-context";

const CATEGORIES = [
  "Juicing Produce",
  "Produce for Daily Use",
  "Frozen Goods",
  "Bread",
  "Dairy/Liquid",
  "Herbs",
  "Salad Items",
];

const categoryIcons = {
  "Juicing Produce": "🍊",
  "Produce for Daily Use": "🥑",
  "Frozen Goods": "❄️",
  Bread: "🍞",
  "Dairy/Liquid": "🥛",
  Herbs: "🌿",
  "Salad Items": "🥗",
};

export default function ParSheetsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState({});
  const { setHeaderConfig, clearHeader } = usePageHeader();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const hasEdits = Object.keys(edits).length > 0;

  // Push title and Save button into the main header
  useEffect(() => {
    setHeaderConfig({
      title: "Daily Ordering Par Sheets",
      description: "Update stock & par values — orders auto-calculate",
      actions: (
        <Button
          onClick={saveAll}
          disabled={!hasEdits || saving}
          className={`transition-all ${
            hasEdits
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
              : ""
          }`}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
          {hasEdits && (
            <Badge
              variant="secondary"
              className="ml-2 bg-white/20 text-white"
            >
              {Object.keys(edits).length}
            </Badge>
          )}
        </Button>
      ),
    });
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEdits, saving, edits]);

  const updateField = (id, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: Number(value) || 0 },
    }));
  };

  const saveAll = async () => {
    const editEntries = Object.entries(edits);
    if (editEntries.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        editEntries.map(([id, data]) =>
          fetch(`/api/inventory/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        )
      );
      toast.success(`Saved ${editEntries.length} item(s)`);
      setEdits({});
      loadItems();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter((item) => item.category === cat);
    return acc;
  }, {});

  const getValue = (item, field) => {
    if (edits[item._id] && field in edits[item._id]) {
      return edits[item._id][field];
    }
    return item[field] || 0;
  };

  const getOrderQty = (item) => {
    const stock = getValue(item, "currentStock");
    const isWeekend = [0, 5, 6].includes(new Date().getDay());
    const par = isWeekend
      ? getValue(item, "weekendPar")
      : getValue(item, "weekdayPar");
    const order = Math.max(0, par - stock);
    return order;
  };



  const renderCategoryTable = (category) => {
    const categoryItems = grouped[category] || [];
    if (categoryItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No items in this category yet.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="w-[300px] font-semibold">Items</TableHead>
              <TableHead className="w-[120px] font-semibold">Code</TableHead>
              <TableHead className="w-[100px] text-center font-semibold">
                Weekday
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold">
                Weekend
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold">
                Stock
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold">
                Order
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryItems.map((item) => (
              <TableRow key={item._id} className="group">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.code || "—"}
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    min="0"
                    className="h-8 text-center text-sm"
                    value={getValue(item, "weekdayPar")}
                    onChange={(e) =>
                      updateField(item._id, "weekdayPar", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    min="0"
                    className="h-8 text-center text-sm"
                    value={getValue(item, "weekendPar")}
                    onChange={(e) =>
                      updateField(item._id, "weekendPar", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    min="0"
                    className="h-8 text-center text-sm"
                    value={getValue(item, "currentStock")}
                    onChange={(e) =>
                      updateField(item._id, "currentStock", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex h-8 min-w-[40px] items-center justify-center rounded-md px-2 text-sm font-semibold ${
                      getOrderQty(item) > 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getOrderQty(item)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue={CATEGORIES[0]} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <span className="mr-1.5">{categoryIcons[cat]}</span>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-amber-500" />
                    {cat}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {(grouped[cat] || []).length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {renderCategoryTable(cat)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
