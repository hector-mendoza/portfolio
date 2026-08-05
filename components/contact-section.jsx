"use client";

import { motion } from "framer-motion";
import ContactInfo from "./contact-info";
import ContactForm from "./contact-form";
import LocationMap from "./location-map";

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-16 md:py-32 bg-background/90">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

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

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <ContactForm />
          </motion.div>
          <LocationMap />
        </div>
      </div>
    </section>
  );
}
