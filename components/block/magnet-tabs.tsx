'use client';

import React from 'react';
import { motion } from 'motion/react';

interface MagnetTabsProps {
    slug: string;
    options: string[];
    onSelect: (option: string) => void;
    activeTab: string;
}

export function MagnetTabs({ slug, options, onSelect, activeTab }: MagnetTabsProps) {
    const [hovered, setHovered] = React.useState<string | undefined>(undefined);

    return (
        <div className="obsidian-magnet-tabs flex items-start justify-start">
            <ul className="flex flex-wrap gap-1 rounded-full border border-border bg-card/60 p-1">
                {options.map((option) => {
                    const isActive = activeTab === option;
                    return (
                        <li
                            onMouseEnter={() => setHovered(option)}
                            onMouseLeave={() => setHovered(undefined)}
                            key={slug + option}
                            onClick={() => onSelect(option)}
                            className="relative shrink-0 cursor-pointer rounded-full"
                        >
                            <p
                                className={`relative z-10 rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {option}
                            </p>

                            {(hovered === option || (hovered === undefined && isActive)) && (
                                <motion.div
                                    layout
                                    layoutId={slug + 'tab-bar-highlight'}
                                    transition={{ duration: 0.2, type: 'spring', bounce: 0 }}
                                    className={`absolute inset-0 rounded-full ${
                                        isActive
                                            ? "bg-primary shadow-lg shadow-primary/20"
                                            : "bg-primary/10"
                                    }`}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default MagnetTabs;
