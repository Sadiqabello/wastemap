"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, ArrowRight } from "lucide-react";

interface BeforeAfterProps {
  beforePhotos: string[];
  afterPhotos: string[];
}

export function BeforeAfter({ beforePhotos, afterPhotos }: BeforeAfterProps) {
  const [selectedBefore, setSelectedBefore] = useState(0);
  const [selectedAfter, setSelectedAfter] = useState(0);

  if (afterPhotos.length === 0) return null;

  const beforeUrl = beforePhotos[selectedBefore] || beforePhotos[0];
  const afterUrl = afterPhotos[selectedAfter] || afterPhotos[0];

  return (
    <div className="rounded-lg border bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-emerald-800">
          Before & After Cleanup
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Before */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-500">Before</p>
          {beforeUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-red-200">
              <Image
                src={beforeUrl}
                alt="Before cleanup"
                fill
                className="object-cover"
              />
              <span className="absolute top-1.5 left-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                BEFORE
              </span>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50">
              <span className="text-xs text-stone-400">No photo</span>
            </div>
          )}
          {beforePhotos.length > 1 && (
            <div className="mt-1.5 flex gap-1">
              {beforePhotos.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setSelectedBefore(i)}
                  className={`h-8 w-8 overflow-hidden rounded border-2 ${
                    i === selectedBefore
                      ? "border-emerald-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Before ${i + 1}`}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* After */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-500">After</p>
          <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-emerald-200">
            <Image
              src={afterUrl}
              alt="After cleanup"
              fill
              className="object-cover"
            />
            <span className="absolute top-1.5 left-1.5 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              AFTER
            </span>
          </div>
          {afterPhotos.length > 1 && (
            <div className="mt-1.5 flex gap-1">
              {afterPhotos.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setSelectedAfter(i)}
                  className={`h-8 w-8 overflow-hidden rounded border-2 ${
                    i === selectedAfter
                      ? "border-emerald-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`After ${i + 1}`}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-700">
        <ArrowRight className="h-3 w-3" />
        <span>This area has been cleaned up!</span>
      </div>
    </div>
  );
}
