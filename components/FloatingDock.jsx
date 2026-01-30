import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
    IconBrandGithub,
    IconBrandLinkedin,
    IconFileCv,
    IconMail,
} from "@tabler/icons-react";

export function FloatingDockPort() {
    const links = [
        {
            title: "CV/Resume",
            icon: (
                <IconFileCv className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "https://cv.hectormendoza.me/",
        },
        {
            title: "LinkedIn",
            icon: (
                <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "https://www.linkedin.com/in/hector-mendoza-m/",
        },
        {
            title: "GitHub",
            icon: (
                <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "https://github.com/hector-mendoza",
        },
    ];
    return (
        (<div className="flex items-center justify-center w-full animate-fadeInUp absolute bottom-8 inset-x-0">
            <FloatingDock
                mobileClassName="dark flex justify-center"
                desktopClassName="dark"
                items={links} />
        </div>)
    );
}
