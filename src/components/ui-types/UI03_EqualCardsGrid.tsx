import React from "react";
import { CoverTile } from "@/components/CoverTile";

export interface EqualCardItem {
  id: string;
  title: string;
  image: string;
  href: string;
  year?: string;
  category?: string;
}

interface UI03_EqualCardsGridProps {
  cards: EqualCardItem[];
  emptyMessage?: string;
}

/**
 * UI03: Equally Sized Cards Grid
 * Approved from: https://www.siavashakbari.ir/graphic-design/visual-identity
 */
export function UI03_EqualCardsGrid({
  cards,
  emptyMessage = "No project cards available in this section.",
}: UI03_EqualCardsGridProps) {
  if (!cards || cards.length === 0) {
    return (
      <p className="mx-auto max-w-3xl py-20 px-6 text-center text-sm text-neutral-500 font-mono">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="w-full px-[13px] sm:px-[20px]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <CoverTile
            key={card.id}
            to={card.href}
            label={card.title}
            image={card.image}
            ariaLabel={`View ${card.title}`}
          />
        ))}
      </div>
    </div>
  );
}
