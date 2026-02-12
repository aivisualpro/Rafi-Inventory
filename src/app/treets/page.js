"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Cookie,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePageHeader } from "@/contexts/page-header-context";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Wellness Shot",
  "Smoothie",
  "Juice",
  "Dessert",
  "Snack",
  "Other",
];

const categoryIcons = {
  "Wellness Shot": "💉",
  Smoothie: "🥤",
  Juice: "🍊",
  Dessert: "🍰",
  Snack: "🍪",
  Other: "📦",
};

const emptyForm = {
  name: "",
  category: "Juice",
  dateMade: "",
  expirationDate: "",
  batchSize: 1,
  notes: "",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export default function TreetsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const { setHeaderConfig, clearHeader } = usePageHeader();

  // Build category list from defaults + any custom categories from existing items
  const allCategories = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...items.map((i) => i.category).filter(Boolean),
    ]),
  ].sort();

  // Group items by category
  const grouped = allCategories.reduce((acc, cat) => {
    const catItems = items.filter(
      (item) =>
        item.category === cat &&
        item.name.toLowerCase().includes(search.toLowerCase())
    );
    if (catItems.length > 0 || items.some((i) => i.category === cat)) {
      acc[cat] = catItems;
    }
    return acc;
  }, {});

  // Only show tabs for categories that have items (ignoring search filter)
  const activeCategories = allCategories.filter((cat) =>
    items.some((i) => i.category === cat)
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/treets");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load treets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  // Build header description from active tab
  const activeCount = activeTab ? (grouped[activeTab] || []).length : 0;
  const headerDesc = activeTab
    ? `${categoryIcons[activeTab] || "📦"} ${activeTab} · ${activeCount} item${activeCount !== 1 ? "s" : ""}`
    : undefined;

  // Push title, search, and Add button into the main header
  useEffect(() => {
    setHeaderConfig({
      title: "Treets",
      description: headerDesc,
      searchValue: search,
      onSearchChange: setSearch,
      searchPlaceholder: "Search treets...",
      actions: (
        <Button
          onClick={openAdd}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Treet
        </Button>
      ),
    });
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTab, activeCount]);

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      dateMade: item.dateMade ? item.dateMade.split("T")[0] : "",
      expirationDate: item.expirationDate
        ? item.expirationDate.split("T")[0]
        : "",
      batchSize: item.batchSize || 1,
      notes: item.notes || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Treet name is required");
      return;
    }

    // Snapshot for rollback
    const prevItems = items;
    const isEdit = !!editingItem;

    if (isEdit) {
      // Optimistic update
      setItems((prev) =>
        prev.map((it) =>
          it._id === editingItem._id ? { ...it, ...formData } : it
        )
      );
    } else {
      // Optimistic create
      const tempItem = { ...formData, _id: `temp-${Date.now()}`, _temp: true };
      setItems((prev) => [tempItem, ...prev]);
    }

    toast.success(isEdit ? "Treet updated" : "Treet created");
    setModalOpen(false);
    setSaving(false);

    // Background API call
    try {
      const url = isEdit
        ? `/api/treets/${editingItem._id}`
        : "/api/treets";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      // Silently sync to get real IDs
      const freshRes = await fetch("/api/treets");
      if (freshRes.ok) setItems(await freshRes.json());
    } catch {
      setItems(prevItems);
      toast.error("Failed to save treet \u2014 reverted");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // Snapshot for rollback
    const prevItems = items;

    // Optimistic remove
    setItems((prev) => prev.filter((it) => it._id !== deleteId));
    toast.success("Treet deleted");
    setDeleteId(null);

    // Background API call
    try {
      const res = await fetch(`/api/treets/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setItems(prevItems);
      toast.error("Failed to delete treet \u2014 reverted");
    }
  };

  // Filtered categories for the combobox
  const filteredCategories = allCategories.filter((cat) =>
    cat.toLowerCase().includes(catSearch.toLowerCase())
  );
  const canAddNew =
    catSearch.trim() !== "" &&
    !allCategories.some(
      (c) => c.toLowerCase() === catSearch.trim().toLowerCase()
    );

  const renderCategoryTable = (category) => {
    const categoryItems = grouped[category] || [];
    if (categoryItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Cookie className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">
            {search
              ? "No treets match your search in this category."
              : "No treets in this category yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="w-[250px] font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Date Made</TableHead>
              <TableHead className="font-semibold">Expiration</TableHead>
              <TableHead className="text-center font-semibold">
                Batch
              </TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryItems.map((item) => (
              <TableRow
                key={item._id}
                className="group cursor-pointer"
                onDoubleClick={() => openEdit(item)}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(item.dateMade)}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm flex items-center gap-1.5 ${
                      isExpired(item.expirationDate)
                        ? "text-red-600 font-semibold"
                        : ""
                    }`}
                  >
                    {isExpired(item.expirationDate) && (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {formatDate(item.expirationDate)}
                  </span>
                </TableCell>
                <TableCell className="text-center">{item.batchSize}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {item.notes || "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(item._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeCategories.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <Cookie className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                No treets yet. Add your first one!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          defaultValue={activeCategories[0]}
          value={activeTab || activeCategories[0]}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {activeCategories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <span className="mr-1.5">
                  {categoryIcons[cat] || "📦"}
                </span>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <Card className="border-border/40">
                <CardContent className="p-0">
                  {renderCategoryTable(cat)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Treet" : "Add New Treet"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update treet details."
                : "Add a new treet to track batches and expiration."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tname">Name *</Label>
                <Input
                  id="tname"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Immunity Shot"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Popover open={catOpen} onOpenChange={setCatOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={catOpen}
                      className="w-full justify-between font-normal"
                    >
                      {formData.category || "Select category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search or add..."
                        value={catSearch}
                        onValueChange={setCatSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {canAddNew ? (
                            <button
                              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  category: catSearch.trim(),
                                });
                                setCatSearch("");
                                setCatOpen(false);
                              }}
                            >
                              <Plus className="h-4 w-4 text-amber-500" />
                              Add &quot;{catSearch.trim()}&quot;
                            </button>
                          ) : (
                            "No categories found."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat}
                              value={cat}
                              onSelect={() => {
                                setFormData({ ...formData, category: cat });
                                setCatSearch("");
                                setCatOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.category === cat
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {cat}
                            </CommandItem>
                          ))}
                          {canAddNew && filteredCategories.length > 0 && (
                            <CommandItem
                              value={`__add_${catSearch.trim()}`}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  category: catSearch.trim(),
                                });
                                setCatSearch("");
                                setCatOpen(false);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4 text-amber-500" />
                              Add &quot;{catSearch.trim()}&quot;
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateMade">Date Made</Label>
                <Input
                  id="dateMade"
                  type="date"
                  value={formData.dateMade}
                  onChange={(e) =>
                    setFormData({ ...formData, dateMade: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expDate">Expiration Date</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expirationDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Size</Label>
                <Input
                  id="batch"
                  type="number"
                  min="1"
                  value={formData.batchSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      batchSize: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tnotes">Notes</Label>
                <Input
                  id="tnotes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            >
              {saving ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Treet</DialogTitle>
            <DialogDescription>
              Are you sure? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
