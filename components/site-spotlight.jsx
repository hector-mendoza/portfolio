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
  { label: "City", icon: <Home />, link: "/" },
  { label: "About", icon: <User />, link: "/classic#about" },
  { label: "Projects", icon: <FolderKanban />, link: "/classic#work" },
  { label: "Blog", icon: <FileText />, link: "/blog" },
];

const SITE_SEARCH = [
  { icon: <Home />, label: "Pilleland", description: "Ride or walk the LEGO city portfolio", link: "/" },
  { icon: <User />, label: "About", description: "Story, stats, and stack", link: "/classic#about" },
  { icon: <FolderKanban />, label: "Projects", description: "Browse client work and experiments", link: "/classic#work" },
  { icon: <Briefcase />, label: "Experience", description: "Roles, education, and skills", link: "/classic#about" },
  { icon: <Mail />, label: "Contact", description: "Email, socials, and location", link: "/classic#contact" },
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
