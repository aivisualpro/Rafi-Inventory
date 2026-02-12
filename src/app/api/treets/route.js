import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Treet from "@/models/Treet";

export async function GET() {
  await dbConnect();
  const items = await Treet.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const item = await Treet.create(body);
  return NextResponse.json(item, { status: 201 });
}
