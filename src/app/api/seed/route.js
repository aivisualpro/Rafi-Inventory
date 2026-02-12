import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Inventory from "@/models/Inventory";

const seedData = [
  // Juicing Produce
  { name: "Blood Orange", category: "Juicing Produce" },
  { name: "Carrots", category: "Juicing Produce" },
  { name: "Celery", category: "Juicing Produce" },
  { name: "Cucumber", category: "Juicing Produce" },
  { name: "Ginger", category: "Juicing Produce" },
  { name: "Grapefruit", category: "Juicing Produce" },
  { name: "Green Apples (Granny)", category: "Juicing Produce" },
  { name: "Jalapeno", category: "Juicing Produce" },
  { name: "Kale", category: "Juicing Produce" },
  { name: "Lemon", category: "Juicing Produce" },
  { name: "Lime", category: "Juicing Produce" },
  { name: "Oranges", category: "Juicing Produce" },
  { name: "Pineapple (Chiquita)", category: "Juicing Produce" },
  { name: "Red Apples (Fiji)", category: "Juicing Produce" },
  { name: "Red Beets", category: "Juicing Produce" },
  { name: "Romaine Lettuce", category: "Juicing Produce" },
  { name: "Spinach", category: "Juicing Produce" },
  { name: "Turmeric", category: "Juicing Produce" },
  { name: "Basil", category: "Juicing Produce" },
  { name: "Mint", category: "Juicing Produce" },

  // Produce for Daily Use
  { name: "Avocado (Hass)", category: "Produce for Daily Use" },
  { name: "Arugula (B&W)", category: "Produce for Daily Use" },
  { name: "Baby Heirloom Tomatoes", category: "Produce for Daily Use" },
  { name: "Banana (turning)", category: "Produce for Daily Use" },
  { name: "Bib Lettuce", category: "Produce for Daily Use" },
  { name: "Blueberry", category: "Produce for Daily Use" },
  { name: "Garlic", category: "Produce for Daily Use" },
  { name: "Kiwi", category: "Produce for Daily Use" },
  { name: "Microgreens (Intensity)", category: "Produce for Daily Use" },
  { name: "Red Onions", category: "Produce for Daily Use" },
  { name: "Shallots", category: "Produce for Daily Use" },
  { name: "Strawberries", category: "Produce for Daily Use" },
  { name: "Tomatoes RED (5x6)", category: "Produce for Daily Use" },
  { name: "Tomatoes YELLOW (Single Layer)", category: "Produce for Daily Use" },
  { name: "Watermelon Radishes", category: "Produce for Daily Use" },
  { name: "White Onions", category: "Produce for Daily Use" },

  // Frozen Goods
  { name: "Frozen Banana", code: "7284664", category: "Frozen Goods" },
  { name: "Frozen Blueberries", code: "1346279", category: "Frozen Goods" },
  { name: "Frozen Mango", code: "7285455", category: "Frozen Goods" },
  { name: "Frozen Pineapples", code: "7285109", category: "Frozen Goods" },
  { name: "Frozen Strawberries", code: "7797368", category: "Frozen Goods" },
  { name: "Acai", code: "7238618", category: "Frozen Goods" },
  { name: "Dragon Fruit", code: "7200046", category: "Frozen Goods" },

  // Bread
  { name: "Multigrain (1cs - 8 loaves)", code: "7163540", category: "Bread" },
  { name: "Rustico (1cs - 10 loaves)", code: "7163548", category: "Bread" },
  { name: "Sourdough (1cs - 6 loaves)", code: "7163543", category: "Bread" },
  { name: "Walnut Raisin (1cs - 8 loaves)", code: "7163583", category: "Bread" },
  { name: "Jalapeno Cheddar (1cs - 8 loaves)", code: "7163586", category: "Bread" },
  { name: "Gluten Free Bread", code: "7040473", category: "Bread" },

  // Dairy/Liquid
  { name: "Almond Milk", code: "3484717", category: "Dairy/Liquid" },
  { name: "Oat Milk (Barista)", code: "9904821", category: "Dairy/Liquid" },
  { name: "Almond Milk (Barista)", code: "2986038", category: "Dairy/Liquid" },
  { name: "Whole Milk (Barista)", code: "2327740", category: "Dairy/Liquid" },
  { name: "2% Milk (Barista)", code: "2327757", category: "Dairy/Liquid" },
  { name: "Chai (Barista)", code: "7101689", category: "Dairy/Liquid" },
  { name: "Half & Half", code: "4828554", category: "Dairy/Liquid" },
  { name: "Coconut Water", code: "4098826", category: "Dairy/Liquid" },
  { name: "Eggs", code: "4767022", category: "Dairy/Liquid" },

  // Herbs
  { name: "Chives", category: "Herbs" },
  { name: "Cilantro", category: "Herbs" },
  { name: "Dill", category: "Herbs" },
  { name: "Parsley (curly)", category: "Herbs" },
  { name: "Scallions", category: "Herbs" },
  { name: "Thyme", category: "Herbs" },

  // Salad Items
  { name: "Spring Mix Greens", category: "Salad Items" },
];

export async function POST() {
  await dbConnect();

  // Check if data already exists
  const count = await Inventory.countDocuments();
  if (count > 0) {
    return NextResponse.json(
      { message: `Database already has ${count} items. Skipping seed.` },
      { status: 200 }
    );
  }

  const items = await Inventory.insertMany(seedData);
  return NextResponse.json(
    { message: `Seeded ${items.length} inventory items.` },
    { status: 201 }
  );
}
