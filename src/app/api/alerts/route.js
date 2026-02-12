import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Treet from "@/models/Treet";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await dbConnect();
    const alerts = [];
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Expired treets
    const expiredTreets = await Treet.find({
      expirationDate: { $lt: now, $ne: null },
    })
      .sort({ expirationDate: 1 })
      .lean();

    for (const t of expiredTreets) {
      alerts.push({
        id: `expired-${t._id}`,
        type: "expired",
        severity: "critical",
        title: `${t.name} has expired`,
        description: `Expired on ${new Date(t.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        category: t.category,
        timestamp: t.expirationDate,
      });
    }

    // 2. Expiring within 3 days
    const expiringSoon = await Treet.find({
      expirationDate: { $gte: now, $lte: threeDaysFromNow },
    })
      .sort({ expirationDate: 1 })
      .lean();

    for (const t of expiringSoon) {
      const daysLeft = Math.ceil(
        (new Date(t.expirationDate) - now) / (1000 * 60 * 60 * 24)
      );
      alerts.push({
        id: `expiring-soon-${t._id}`,
        type: "expiring_soon",
        severity: "warning",
        title: `${t.name} expires ${daysLeft === 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}`,
        description: `Expires ${new Date(t.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        category: t.category,
        timestamp: t.expirationDate,
      });
    }

    // 3. Expiring within 7 days (but not within 3)
    const expiringWeek = await Treet.find({
      expirationDate: { $gt: threeDaysFromNow, $lte: sevenDaysFromNow },
    })
      .sort({ expirationDate: 1 })
      .lean();

    for (const t of expiringWeek) {
      const daysLeft = Math.ceil(
        (new Date(t.expirationDate) - now) / (1000 * 60 * 60 * 24)
      );
      alerts.push({
        id: `expiring-week-${t._id}`,
        type: "expiring_week",
        severity: "info",
        title: `${t.name} expires in ${daysLeft} days`,
        description: `Expires ${new Date(t.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        category: t.category,
        timestamp: t.expirationDate,
      });
    }

    // 4. Out-of-stock inventory
    const outOfStock = await Inventory.find({ currentStock: 0 })
      .sort({ name: 1 })
      .lean();

    for (const item of outOfStock) {
      alerts.push({
        id: `oos-${item._id}`,
        type: "out_of_stock",
        severity: "critical",
        title: `${item.name} is out of stock`,
        description: `Category: ${item.category}`,
        category: item.category,
        timestamp: item.updatedAt,
      });
    }

    // 5. Low stock (stock <= 2 but > 0)
    const lowStock = await Inventory.find({
      currentStock: { $gt: 0, $lte: 2 },
    })
      .sort({ currentStock: 1 })
      .lean();

    for (const item of lowStock) {
      alerts.push({
        id: `low-${item._id}`,
        type: "low_stock",
        severity: "warning",
        title: `${item.name} is running low`,
        description: `Only ${item.currentStock} ${item.unit || "units"} left`,
        category: item.category,
        timestamp: item.updatedAt,
      });
    }

    // Sort: critical first, then warning, then info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort(
      (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
    );

    return NextResponse.json({ alerts, count: alerts.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
