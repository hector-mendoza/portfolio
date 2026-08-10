"use client";

import { motion } from "motion/react";
import ContactInfo from "./contact-info";
import ContactForm from "./contact-form";
import LocationMap from "./location-map";

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-16 md:py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-14"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Contact
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="text-balance block">
              {"Let's build "}
              <span className="text-gradient">together</span>
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <ContactInfo />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex min-h-[420px] h-full"
          >
            <ContactForm />
          </motion.div>
          <LocationMap />
        </div>
      </div>
    </section>
  );
}
