"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
      } else {
        router.push("/dashboard"); // login থাকলে home থেকে dashboard এ নেবে
      }
    }
  }, [token, loading, router]);

  return <p className="text-center mt-10 text-gray-500">Redirecting...</p>;
}
