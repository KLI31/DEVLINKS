"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Review {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface CardReviewProps {
  review: Review;
  className?: string;
}

export function CardReview({ review, className }: CardReviewProps) {
  return (
    <article
      className={cn(
        "w-full rounded-2xl border border-border bg-card p-4 shadow-sm",
        "transition-shadow duration-300 hover:shadow-hover",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          src={review.avatar}
          alt={`Avatar de ${review.name}`}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {review.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{review.role}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star
              key={i}
              className="size-3 fill-primary text-primary"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{review.content}&rdquo;
      </p>
    </article>
  );
}
