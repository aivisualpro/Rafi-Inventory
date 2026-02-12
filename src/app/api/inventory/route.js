import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Inventory from "@/models/Inventory";

export async function GET() {
  await dbConnect();
  const items = await Inventory.find().sort({ category: 1, name: 1 });
  return NextResponse.json(items);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const item = await Inventory.create(body);
  return NextResponse.json(item, { status: 201 });
}
