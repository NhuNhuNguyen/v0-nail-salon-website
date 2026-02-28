"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "Do I need an appointment?",
    a: "Walk-ins are king here. But if you want to skip the wait, give us a quick call.",
  },
  {
    q: "How long do your nails last?",
    a: "We guarantee 14 days of perfect wear on our nail sets when properly cared for.",
  },
  {
    q: "Do you do custom nail art?",
    a: "Yes! Bring your Pinterest or Instagram photos — we love custom designs.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <h2 className="text-center font-serif text-3xl leading-tight text-foreground md:text-4xl">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
