"use client";

import { useState, type FormEvent } from "react";
import { submitContactForm } from "@/lib/api";
import type { ContactFormData } from "@/types";

const inputClass = "mt-1 block w-full rounded-xl border border-neutral-200 bg-light-2 px-4 py-3 text-body-b5 text-neutral-900 placeholder-neutral-400 focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/30 transition-colors";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <span className="icon icon__check text-green-600" style={{ '--icon-size': '24px' } as React.CSSProperties} />
        </div>
        <h3 className="text-body-b3 font-bold text-green-900">
          Message Sent Successfully!
        </h3>
        <p className="mt-2 text-caption-c2 text-green-700">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-caption-c2 font-medium text-warning hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-caption-c2 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-caption-c2 font-medium text-neutral-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
            className={inputClass} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-caption-c2 font-medium text-neutral-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
            className={inputClass} placeholder="your@email.com" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-caption-c2 font-medium text-neutral-700">
            Phone
          </label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
            className={inputClass} placeholder="+62 xxx xxxx xxxx" />
        </div>
        <div>
          <label htmlFor="subject" className="block text-caption-c2 font-medium text-neutral-700">
            Subject <span className="text-red-500">*</span>
          </label>
          <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange}
            className={inputClass} placeholder="How can we help?" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-caption-c2 font-medium text-neutral-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea id="message" name="message" required rows={5} value={formData.message} onChange={handleChange}
          className={inputClass} placeholder="Tell us more about your inquiry..." />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn btn-primary btn-lg w-full sm:w-auto">
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
