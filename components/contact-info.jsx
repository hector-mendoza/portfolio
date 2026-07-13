"use client";

import { useRef } from "react";
import { MailIcon, MapPinIcon, GlobeIcon } from "@animateicons/react/lucide";
import SocialLinks from "./social-links";

function ContactRow({ Icon, label, children }) {
  const ref = useRef(null);
  return (
    <div
      className="flex items-center gap-3 group"
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Icon ref={ref} size={20} color="hsl(var(--primary))" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

export default function ContactInfo() {
  return (
    <div>
      <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
        {"Interested in working together? Whether you need a "}
        <span className="text-foreground font-medium">new website</span>
        {", an "}
        <span className="text-foreground font-medium">e-commerce platform</span>
        {", or a "}
        <span className="text-foreground font-medium">custom web application</span>
        {", I'd love to hear about your project."}
      </p>

      <div className="mb-10 space-y-4">
        <ContactRow Icon={MailIcon} label="Email">
          <a
            href="mailto:hey@hectormendoza.me"
            data-cuelume-hover="tick"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            hey@hectormendoza.me
          </a>
        </ContactRow>

        <ContactRow Icon={MapPinIcon} label="Location">
          <p className="text-sm font-medium text-foreground">Morelia, Mexico</p>
        </ContactRow>

        <ContactRow Icon={GlobeIcon} label="Website">
          <a
            href="https://hectormendoza.me"
            target="_blank"
            rel="noopener noreferrer"
            data-cuelume-hover="tick"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            hectormendoza.me
          </a>
        </ContactRow>
      </div>

      <SocialLinks />
    </div>
  );
}
