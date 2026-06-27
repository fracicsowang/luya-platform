"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="p-8 text-sm text-gray-500">
      Loading… <Link href="/dashboard" className="text-green-700 underline">Dashboard</Link>
    </div>
  );
}
