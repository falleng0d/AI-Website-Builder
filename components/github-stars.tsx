"use client";

import { useEffect, useState } from "react";
import { Loader, Star } from "lucide-react"; // Optional icon

export function GithubStars() {
  const [stars, setStars] = useState<number | null>(null);

  const fetchStars = async () => {
    try {
      const res = await fetch("/api/github-star");
      const data = await res.json();
      setStars(data.stars);
    } catch (err) {
      console.error("Failed to fetch stars:", err);
      setStars(0);
    }
  };

  useEffect(() => {
    fetchStars();
  }, []);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/70"
      title="GitHub Stars for devAaus/better-auth"
    >
      <Star className="h-4 w-4 text-yellow-500" />
      {stars !== null ? <span className="font-medium">{stars}</span> : <Loader className="h-4 w-4 animate-spin" />}
    </div>
  );
}
