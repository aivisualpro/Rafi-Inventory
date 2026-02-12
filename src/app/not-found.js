import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Image
        src="/Rafi-Logo.png"
        alt="Rafi's Inventory Management"
        width={80}
        height={80}
        className="mb-6 rounded-2xl object-contain"
      />
      <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        This page doesn&apos;t exist. It may have been moved or the URL might be
        incorrect.
      </p>
      <Button asChild variant="outline">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
