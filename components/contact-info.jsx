"use client";

import { useRef } from "react";
import { MailIcon, GlobeIcon } from "@animateicons/react/lucide";
import SocialLinks from "./social-links";

function ContactRow({ Icon, label, children }) {
  const ref = useRef(null);
  return (
    <div
      className="flex items-center gap-3 group"
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
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
    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
        {"Interested in working together? Whether you need a "}
        <span className="font-medium text-foreground">new website</span>
        {", an "}
        <span className="font-medium text-foreground">e-commerce platform</span>
        {", or a "}
        <span className="font-medium text-foreground">custom web application</span>
        {", I'd love to hear about your project."}
      </p>

      <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row xl:items-center xl:gap-10">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <ContactRow Icon={MailIcon} label="Email">
            <a
              href="mailto:hey@hectormendoza.me"
              data-cuelume-hover="tick"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              hey@hectormendoza.me
            </a>
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
    </div>
  );
}
