'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface MasonryGridProps {
    items: { image: string; title: string; description: string }[];
    columns?: number;
}

export function MasonryGrid({ items, columns }: MasonryGridProps) {
    const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});

    if (!items || items.length === 0) {
        return <div className="text-center p-4">No items to display</div>;
    }

    const getColumnCount = () => {
        if (typeof window === 'undefined') return 1;
        const width = window.innerWidth;
        if (width >= 1024) return 4;
        if (width >= 768) return 3;
        if (width >= 640) return 2;
        return 1;
    };

    return (
        <div
            style={{ columns: columns }}
            className={`${!columns && 'columns-1 sm:columns-2 md:columns-3 lg:columns-4'} gap-2 overflow-y-auto p-3 w-full max-w-4xl`}
        >
            {items.map((item, index) => {
                const columnCount = columns || getColumnCount();
                const rowIndex = Math.floor(index / columnCount);

                return (
                    <motion.div
                        key={index}
                        className="break-inside-avoid mb-4 relative group rounded-xl overflow-hidden p-1 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: rowIndex * 0.1, ease: 'easeOut' } }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="relative w-full flex gap-1 flex-col items-start justify-start">
                            {!imagesLoaded[item.image] && (
                                <div className="absolute inset-0 w-full h-[300px] bg-neutral-500/50 animate-pulse rounded-lg" />
                            )}
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={400}
                                height={300}
                                className={`w-full h-auto transition-transform duration-300 rounded-lg ${!imagesLoaded[item.image] ? 'opacity-0' : 'opacity-100'}`}
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                onLoad={() => setImagesLoaded((prev) => ({ ...prev, [item.image]: true }))}
                                onError={() => setImagesLoaded((prev) => ({ ...prev, [item.image]: true }))}
                            />
                            {imagesLoaded[item.image] && (
                                <div className="w-full">
                                    <h3 className="text-sm font-medium">{item.title}</h3>
                                    <p className="mt-0 text-xs text-neutral-500 line-clamp-2 overflow-hidden">{item.description}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default MasonryGrid;
