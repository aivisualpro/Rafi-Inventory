import {
  Package,
  TrendingDown,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Inventory from "@/models/Inventory";
import Treet from "@/models/Treet";
import { DashboardHeader } from "./dashboard-header";

async function getStats() {
  await dbConnect();

  const [totalItems, categories, lowStock, treetCount] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.distinct("category"),
    Inventory.find({ currentStock: { $lte: 2 }, currentStock: { $gt: 0 } }).countDocuments(),
    Treet.countDocuments(),
  ]);

  const zeroStock = await Inventory.countDocuments({ currentStock: 0 });

  const categoryBreakdown = await Inventory.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const recentItems = await Inventory.find()
    .sort({ updatedAt: -1 })
    .limit(8)
    .lean();

  return {
    totalItems,
    categories: categories.length,
    lowStock,
    zeroStock,
    treetCount,
    categoryBreakdown,
    recentItems,
  };
}

const categoryColors = {
  "Juicing Produce": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Produce for Daily Use": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Frozen Goods": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Bread": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Dairy/Liquid": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Herbs": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  "Salad Items": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  "Other": "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      desc: `Across ${stats.categories} categories`,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: TrendingDown,
      desc: "Items running low",
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      title: "Out of Stock",
      value: stats.zeroStock,
      icon: AlertTriangle,
      desc: "Need immediate reorder",
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Active Treets",
      value: stats.treetCount,
      icon: ClipboardCheck,
      desc: "Wellness shots & smoothies",
      gradient: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-border/40 transition-shadow hover:shadow-lg"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}
              >
                <stat.icon className="h-4.5 w-4.5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category breakdown + Recent items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryBreakdown.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={categoryColors[cat._id] || categoryColors.Other}
                    >
                      {cat._id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                        style={{
                          width: `${Math.min(
                            (cat.count / stats.totalItems) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent items */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No items yet — seed the database to get started.
                </p>
              ) : (
                stats.recentItems.map((item) => (
                  <div
                    key={item._id.toString()}
                    className="flex items-center justify-between rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {item.currentStock}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
