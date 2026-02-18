"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { sileo } from "sileo";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export default function ContactForm() {
  const captchaRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const captchaToken = watch("captchaToken");

  const handleCaptchaVerify = (token) => {
    setValue("captchaToken", token);
  };

  const onSubmit = async (data) => {
    if (!data.captchaToken) {
      sileo.error({
        title: "Captcha incomplete",
        description: "Please complete the captcha",
        fill: "black",
        styles: {
          title: "text-white!",
          description: "text-white/75!",
        },
      });
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        sileo.success({
          title: "Message sent",
          description: "Thank you for reaching out! I'll get back to you soon.",
          fill: "black",
          styles: {
            title: "text-white!",
            description: "text-white/75!",
          },
        });
        reset();
        captchaRef.current?.resetCaptcha();
      } else {
        sileo.error({
          title: "Failed to send message",
          description: result.error || "Please try again later.",
          fill: "black",
          styles: {
            title: "text-white!",
            description: "text-white/75!",
          },
        });
      }
    } catch (error) {
      sileo.error({
        title: "An error occurred",
        description: "Please try again later.",
        fill: "black",
        styles: {
          title: "text-white!",
          description: "text-white/75!",
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-border bg-card p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
            placeholder="you@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="subject"
          className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          {...register("subject")}
          className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
          placeholder="Project inquiry"
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
          placeholder="Tell me about your project..."
        />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <div className="flex justify-center">
        <HCaptcha
          ref={captchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
          onVerify={handleCaptchaVerify}
          theme="dark"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !captchaToken}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </button>
    </form>
  );
}
