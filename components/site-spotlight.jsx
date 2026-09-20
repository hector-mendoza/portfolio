"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  Mail,
  User,
} from "lucide-react";
import { AppleSpotlight } from "@/components/block/apple-spotlight";

const SITE_SHORTCUTS = [
  { label: "Home", icon: <Home />, link: "/#hero" },
  { label: "About", icon: <User />, link: "/#about" },
  { label: "Projects", icon: <FolderKanban />, link: "/#projects" },
  { label: "Blog", icon: <FileText />, link: "/blog" },
];

const SITE_SEARCH = [
  { icon: <Home />, label: "Home", description: "Back to the hero", link: "/#hero" },
  { icon: <User />, label: "About", description: "Story, stats, and stack", link: "/#about" },
  { icon: <FolderKanban />, label: "Projects", description: "Browse client work and experiments", link: "/#projects" },
  { icon: <Briefcase />, label: "Experience", description: "Roles, education, and skills", link: "/#experience" },
  { icon: <Mail />, label: "Contact", description: "Email, socials, and location", link: "/#contact" },
  { icon: <FileText />, label: "Blog", description: "Featured writing from Sanity", link: "/blog" },
  { icon: <GraduationCap />, label: "Sanity Studio", description: "Manage blog content", link: "/studio" },
];

export default function SiteSpotlight({ open, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;

  const setOpen = useMemo(
    () => onOpenChange ?? setInternalOpen,
    [onOpenChange],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onToggle = () => setOpen((value) => !value);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("site-spotlight:toggle", onToggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("site-spotlight:toggle", onToggle);
    };
  }, [setOpen]);

  return (
    <AppleSpotlight
      shortcuts={SITE_SHORTCUTS}
      searchResults={SITE_SEARCH}
      isOpen={isOpen}
      handleClose={() => setOpen(false)}
    />
  );
}
