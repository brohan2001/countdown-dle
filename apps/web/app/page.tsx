"use client";

import { ExpressMatch } from "@/components/ExpressMatch";

export default function Home() {
  return (
    <ExpressMatch
      onComplete={(score) => {
        console.log("Game completed with score:", score);
      }}
    />
  );
}
