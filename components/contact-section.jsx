"use client";

import ContactInfo from "./contact-info";
import SocialLinks from "./social-links";
import LocationMap from "./location-map";

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-16 md:py-24">
      <div className="notion-section-inner">
        <p className="notion-caption mb-2">Contact</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Let&apos;s work together
        </h2>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <ContactInfo />
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <SocialLinks />
            <a href="mailto:hey@hectormendoza.me" className="notion-btn">
              Send an email
            </a>
          </div>
        </div>

        <div className="mt-12">
          <LocationMap />
        </div>
      </div>
    </section>
  );
}
