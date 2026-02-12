"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePageHeader } from "@/contexts/page-header-context";
import { cn } from "@/lib/utils";

const SUPPLY_CATEGORIES = [
  "Juicing Produce",
  "Produce for Daily Use",
  "Frozen Goods",
  "Bread",
  "Dairy/Liquid",
  "Herbs",
  "Salad Items",
  "Packaging",
  "Cleaning Supplies",
  "Equipment",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  categories: [],
  accountNumber: "",
  deliveryDays: [],
  notes: "",
  active: true,
};

export default function VendorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { setHeaderConfig, clearHeader } = usePageHeader();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load vendors");
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

  useEffect(() => {
    setHeaderConfig({
      title: "Vendors",
      searchValue: search,
      onSearchChange: setSearch,
      searchPlaceholder: "Search vendors...",
      actions: (
        <Button
          onClick={openAdd}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      ),
    });
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.contactName &&
        item.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contactName: item.contactName || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      categories: item.categories || [],
      accountNumber: item.accountNumber || "",
      deliveryDays: item.deliveryDays || [],
      notes: item.notes || "",
      active: item.active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vendor name is required");
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

    toast.success(isEdit ? "Vendor updated" : "Vendor added");
    setModalOpen(false);
    setSaving(false);

    // Background API call
    try {
      const url = isEdit
        ? `/api/vendors/${editingItem._id}`
        : "/api/vendors";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      // Silently sync to get real IDs
      const freshRes = await fetch("/api/vendors");
      if (freshRes.ok) setItems(await freshRes.json());
    } catch {
      setItems(prevItems);
      toast.error("Failed to save vendor \u2014 reverted");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // Snapshot for rollback
    const prevItems = items;

    // Optimistic remove
    setItems((prev) => prev.filter((it) => it._id !== deleteId));
    toast.success("Vendor deleted");
    setDeleteId(null);

    // Background API call
    try {
      const res = await fetch(`/api/vendors/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setItems(prevItems);
      toast.error("Failed to delete vendor \u2014 reverted");
    }
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter((d) => d !== day)
        : [...prev.deliveryDays, day],
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            All Vendors
          </CardTitle>
          <CardDescription>
            {filtered.length} vendor{filtered.length !== 1 && "s"}
            {search && " matching"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                {items.length === 0
                  ? "No vendors yet. Add your first supplier!"
                  : "No vendors match your search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px]">Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Delivery Days</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow
                      key={item._id}
                      className="group cursor-pointer"
                      onDoubleClick={() => openEdit(item)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.accountNumber && (
                            <p className="text-xs text-muted-foreground font-mono">
                              #{item.accountNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.contactName || "—"}
                      </TableCell>
                      <TableCell>
                        {item.phone ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.phone}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(item.categories || []).length > 0 ? (
                            item.categories.slice(0, 2).map((cat) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {cat}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                          {(item.categories || []).length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{item.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(item.deliveryDays || []).length > 0 ? (
                            item.deliveryDays.map((day) => (
                              <span
                                key={day}
                                className="inline-flex h-6 w-8 items-center justify-center rounded bg-amber-100 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.active !== false ? "default" : "outline"}
                          className={
                            item.active !== false
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "text-muted-foreground"
                          }
                        >
                          {item.active !== false ? "Active" : "Inactive"}
                        </Badge>
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update vendor details."
                : "Add a new supplier to your vendor list."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Row 1: Name + Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vname">Vendor Name *</Label>
                <Input
                  id="vname"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. SYSCO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vcontact">Contact Person</Label>
                <Input
                  id="vcontact"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>

            {/* Row 2: Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vphone">Phone</Label>
                <Input
                  id="vphone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vemail">Email</Label>
                <Input
                  id="vemail"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="vendor@example.com"
                />
              </div>
            </div>

            {/* Row 3: Address + Account */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vaddress">Address</Label>
                <Input
                  id="vaddress"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccount">Account Number</Label>
                <Input
                  id="vaccount"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="e.g. AC-12345"
                />
              </div>
            </div>

            {/* Supply Categories */}
            <div className="space-y-2">
              <Label>Supply Categories</Label>
              <Popover open={catOpen} onOpenChange={setCatOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal h-auto min-h-9"
                  >
                    {formData.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {formData.categories.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "Select categories..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {SUPPLY_CATEGORIES.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={() => toggleCategory(cat)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.categories.includes(cat)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {cat}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Delivery Days */}
            <div className="space-y-2">
              <Label>Delivery Days</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "inline-flex h-9 w-12 items-center justify-center rounded-md border text-sm font-medium transition-colors cursor-pointer",
                      formData.deliveryDays.includes(day)
                        ? "bg-amber-500 text-white border-amber-500"
                        : "border-border bg-background hover:bg-accent"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="vnotes">Notes</Label>
              <Input
                id="vnotes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes about this vendor"
              />
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
            <DialogTitle>Delete Vendor</DialogTitle>
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
