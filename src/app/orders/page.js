"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Trash2,
  Send,
  PackageCheck,
  Ban,
  ChevronRight,
  FileText,
  X,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePageHeader } from "@/contexts/page-header-context";
import { cn } from "@/lib/utils";

/* ─── Status config ──────────────────────────── */
const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
    dot: "bg-gray-400",
    gradient: "from-gray-400 to-gray-500",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
  },
  received: {
    label: "Received",
    icon: CheckCircle2,
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
    gradient: "from-red-500 to-rose-600",
  },
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/* ─── Component ──────────────────────────────── */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create order state
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [saving, setSaving] = useState(false);

  // Detail sheet
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);

  const { setHeaderConfig, clearHeader } = usePageHeader();

  /* ─── Data loading ─────────────────────────── */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/vendors");
      setVendors(await res.json());
    } catch {}
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      setInventory(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadOrders();
    loadVendors();
    loadInventory();
  }, [loadOrders, loadVendors, loadInventory]);

  /* ─── Filtering ────────────────────────────── */
  const filtered = orders.filter((o) => {
    const matchStatus =
      statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      (o.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.vendorName || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: orders.length,
    draft: orders.filter((o) => o.status === "draft").length,
    submitted: orders.filter((o) => o.status === "submitted").length,
    received: orders.filter((o) => o.status === "received").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  /* ─── Header ───────────────────────────────── */
  const openCreate = () => {
    setSelectedVendor(null);
    setOrderItems([]);
    setOrderNotes("");
    setExpectedDelivery("");
    setCreateOpen(true);
  };

  useEffect(() => {
    const desc =
      statusFilter === "all"
        ? `${filtered.length} order${filtered.length !== 1 ? "s" : ""}`
        : `${statusConfig[statusFilter]?.label} · ${filtered.length} order${filtered.length !== 1 ? "s" : ""}`;

    setHeaderConfig({
      title: "Orders",
      description: desc,
      searchValue: search,
      onSearchChange: setSearch,
      searchPlaceholder: "Search orders...",
      actions: (
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      ),
    });
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, filtered.length]);

  /* ─── Create order helpers ─────────────────── */
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorOpen(false);
    setVendorSearch("");

    // Pre-populate items from inventory matching vendor categories
    const vendorCats = vendor.categories || [];
    let matchingItems = [];
    if (vendorCats.length > 0) {
      matchingItems = inventory
        .filter((i) => vendorCats.includes(i.category))
        .map((i) => ({
          name: i.name,
          size: i.unit || "",
          parQty: i.weekdayPar || 0,
          currentStock: i.currentStock || 0,
          orderQty: Math.max(0, (i.weekdayPar || 0) - (i.currentStock || 0)),
          unit: i.unit || "",
          notes: "",
        }));
    }
    setOrderItems(
      matchingItems.length > 0
        ? matchingItems
        : [{ name: "", size: "", parQty: 0, currentStock: 0, orderQty: 1, unit: "", notes: "" }]
    );
  };

  const addEmptyItem = () => {
    setOrderItems([
      ...orderItems,
      { name: "", size: "", parQty: 0, currentStock: 0, orderQty: 1, unit: "", notes: "" },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!selectedVendor) {
      toast.error("Please select a vendor");
      return;
    }
    const validItems = orderItems.filter(
      (i) => i.name.trim() && i.orderQty > 0
    );
    if (validItems.length === 0) {
      toast.error("Add at least one item with quantity > 0");
      return;
    }

    // Snapshot for rollback
    const prevOrders = orders;

    // Optimistic create with temp data
    const tempOrder = {
      _id: `temp-${Date.now()}`,
      orderNumber: `ORD-...`,
      vendor: selectedVendor._id,
      vendorName: selectedVendor.name,
      items: validItems,
      totalItems: validItems.reduce((s, i) => s + (Number(i.orderQty) || 0), 0),
      notes: orderNotes,
      expectedDelivery: expectedDelivery || null,
      orderDate: new Date().toISOString(),
      status: "draft",
      _temp: true,
    };
    setOrders((prev) => [tempOrder, ...prev]);
    toast.success("Order created!");
    setCreateOpen(false);
    setSaving(false);

    // Background API call
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor: selectedVendor._id,
          vendorName: selectedVendor.name,
          items: validItems,
          notes: orderNotes,
          expectedDelivery: expectedDelivery || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      // Sync to get real data
      const freshRes = await fetch("/api/orders");
      if (freshRes.ok) setOrders(await freshRes.json());
    } catch {
      setOrders(prevOrders);
      toast.error("Failed to create order \u2014 reverted");
    }
  };

  /* ─── Status update ────────────────────────── */
  const updateStatus = async (orderId, newStatus) => {
    // Snapshot for rollback
    const prevOrders = orders;
    const prevDetail = detailOrder;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: newStatus, ...(newStatus === 'received' ? { receivedDate: new Date().toISOString() } : {}) } : o
      )
    );
    if (detailOrder?._id === orderId) {
      setDetailOrder({ ...detailOrder, status: newStatus });
    }
    toast.success(`Order marked as ${statusConfig[newStatus]?.label}`);

    // Background API call
    try {
      const body = { status: newStatus };
      if (newStatus === "received") body.receivedDate = new Date();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setOrders(prevOrders);
      if (prevDetail) setDetailOrder(prevDetail);
      toast.error("Failed to update order \u2014 reverted");
    }
  };

  /* ─── Delete ───────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteId) return;

    // Snapshot for rollback
    const prevOrders = orders;

    // Optimistic remove
    setOrders((prev) => prev.filter((o) => o._id !== deleteId));
    toast.success("Order deleted");
    if (detailOrder?._id === deleteId) setDetailOpen(false);
    setDeleteId(null);

    // Background API call
    try {
      const res = await fetch(`/api/orders/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setOrders(prevOrders);
      toast.error("Failed to delete order \u2014 reverted");
    }
  };

  /* ─── View detail ──────────────────────────── */
  const openDetail = (order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const totalOrderQty = orderItems.reduce((s, i) => s + (Number(i.orderQty) || 0), 0);

  /* ─── Render ───────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Status tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            All
            {statusCounts.all > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px] px-1.5">
                {statusCounts.all}
              </Badge>
            )}
          </TabsTrigger>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <cfg.icon className="mr-1.5 h-3.5 w-3.5" />
              {cfg.label}
              {statusCounts[key] > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px] px-1.5">
                  {statusCounts[key]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Orders grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                {orders.length === 0
                  ? "No orders yet"
                  : "No orders match your filter"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {orders.length === 0 &&
                  "Create your first order to start tracking vendor purchases."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.draft;
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={order._id}
                className="group border-border/40 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                onClick={() => openDetail(order)}
              >
                {/* Status gradient stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.gradient}`}
                />
                <CardContent className="p-5 pt-6">
                  {/* Top row: order number + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {order.orderNumber}
                      </p>
                      <h3 className="text-base font-semibold mt-0.5 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-amber-500" />
                        {order.vendorName}
                      </h3>
                    </div>
                    <Badge className={`text-[10px] ${cfg.color} border-0`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold">
                        {order.items?.length || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Items
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold">
                        {order.totalItems || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Qty
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-xs font-semibold">
                        {formatDateShort(order.orderDate)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Created
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground">
                      {order.expectedDelivery
                        ? `Expected: ${formatDateShort(order.expectedDelivery)}`
                        : "No delivery date set"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-amber-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create Order Dialog ─────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              Create New Order
            </DialogTitle>
            <DialogDescription>
              Select a vendor and add items to your order.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 space-y-5">
            {/* Vendor selector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {selectedVendor?.name || "Select vendor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search vendors..."
                        value={vendorSearch}
                        onValueChange={setVendorSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No vendors found.</CommandEmpty>
                        <CommandGroup>
                          {vendors
                            .filter((v) =>
                              v.name
                                .toLowerCase()
                                .includes(vendorSearch.toLowerCase())
                            )
                            .map((v) => (
                              <CommandItem
                                key={v._id}
                                value={v.name}
                                onSelect={() => handleVendorSelect(v)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedVendor?._id === v._id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div>
                                  <p className="text-sm">{v.name}</p>
                                  {v.categories?.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {v.categories.slice(0, 2).join(", ")}
                                    </p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
            </div>

            {/* Items table */}
            {selectedVendor && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      Order Items
                    </Label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {orderItems.filter((i) => i.orderQty > 0).length} items
                        · {totalOrderQty} total qty
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEmptyItem}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Row
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="w-[200px] text-xs font-semibold">
                            Item
                          </TableHead>
                          <TableHead className="w-[80px] text-xs font-semibold text-center">
                            Size
                          </TableHead>
                          <TableHead className="w-[70px] text-xs font-semibold text-center">
                            Par
                          </TableHead>
                          <TableHead className="w-[70px] text-xs font-semibold text-center">
                            Stock
                          </TableHead>
                          <TableHead className="w-[80px] text-xs font-semibold text-center">
                            Order Qty
                          </TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, idx) => (
                          <TableRow key={idx} className="group">
                            <TableCell className="p-1.5">
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  updateItem(idx, "name", e.target.value)
                                }
                                placeholder="Item name"
                                className="h-8 text-sm border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell className="p-1.5">
                              <Input
                                value={item.size}
                                onChange={(e) =>
                                  updateItem(idx, "size", e.target.value)
                                }
                                placeholder="Size"
                                className="h-8 text-sm text-center border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {item.parQty}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "text-sm",
                                  item.currentStock === 0
                                    ? "text-red-600 font-semibold"
                                    : item.currentStock <= 2
                                      ? "text-amber-600 font-semibold"
                                      : "text-muted-foreground"
                                )}
                              >
                                {item.currentStock}
                              </span>
                            </TableCell>
                            <TableCell className="p-1.5">
                              <Input
                                type="number"
                                min="0"
                                value={item.orderQty}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "orderQty",
                                    Number(e.target.value)
                                  )
                                }
                                className={cn(
                                  "h-8 text-sm text-center border-0 focus-visible:ring-1",
                                  item.orderQty > 0
                                    ? "bg-amber-50 dark:bg-amber-900/20 font-semibold"
                                    : "bg-transparent"
                                )}
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => removeItem(idx)}
                              >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Optional delivery instructions..."
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/40 mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !selectedVendor}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            >
              {saving ? "Creating..." : `Create Order (${totalOrderQty} items)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Order Detail Sheet ──────────────── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:w-[520px] p-0 flex flex-col">
          {detailOrder && (() => {
            const cfg =
              statusConfig[detailOrder.status] || statusConfig.draft;
            const StatusIcon = cfg.icon;
            return (
              <>
                <SheetHeader className="px-6 pt-6 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {detailOrder.orderNumber}
                      </p>
                      <SheetTitle className="text-xl mt-1">
                        {detailOrder.vendorName}
                      </SheetTitle>
                    </div>
                    <Badge
                      className={`text-xs ${cfg.color} border-0 px-3 py-1`}
                    >
                      <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold">
                        {detailOrder.items?.length || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Line Items
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-lg font-bold">
                        {detailOrder.totalItems || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Qty
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-xs font-semibold">
                        {formatDateShort(detailOrder.orderDate)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Order Date
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {detailOrder.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        onClick={() =>
                          updateStatus(detailOrder._id, "submitted")
                        }
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Submit Order
                      </Button>
                    )}
                    {detailOrder.status === "submitted" && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        onClick={() =>
                          updateStatus(detailOrder._id, "received")
                        }
                      >
                        <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                        Mark Received
                      </Button>
                    )}
                    {(detailOrder.status === "draft" ||
                      detailOrder.status === "submitted") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          updateStatus(detailOrder._id, "cancelled")
                        }
                      >
                        <Ban className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive ml-auto"
                      onClick={() => {
                        setDeleteId(detailOrder._id);
                      }}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </SheetHeader>

                <Separator />

                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Order Items
                  </h3>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="text-xs font-semibold">
                            Item
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Size
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Stock
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center">
                            Order
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(detailOrder.items || []).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-sm text-center text-muted-foreground">
                              {item.size || "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "text-sm",
                                  item.currentStock === 0
                                    ? "text-red-600 font-bold"
                                    : ""
                                )}
                              >
                                {item.currentStock}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  item.orderQty > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                                )}
                              >
                                {item.orderQty}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Dates & Notes */}
                  <div className="mt-5 space-y-3">
                    {detailOrder.expectedDelivery && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Expected:
                        </span>
                        <span className="font-medium">
                          {formatDate(detailOrder.expectedDelivery)}
                        </span>
                      </div>
                    )}
                    {detailOrder.receivedDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">
                          Received:
                        </span>
                        <span className="font-medium">
                          {formatDate(detailOrder.receivedDate)}
                        </span>
                      </div>
                    )}
                    {detailOrder.notes && (
                      <div className="rounded-lg bg-muted/50 p-3 mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm">{detailOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ─── Delete Confirmation ─────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
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
