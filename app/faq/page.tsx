"use client";

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "How does TruthLens verify news articles?",
      answer: "TruthLens uses a combination of AI technology and expert analysis to verify news articles. Our system checks source credibility, cross-references information, and analyzes content patterns to detect potential misinformation."
    },
    {
      question: "What makes a news source credible?",
      answer: "Credible news sources typically have a track record of accurate reporting, transparent editorial processes, clear attribution of sources, and corrections when errors occur. We evaluate sources based on these criteria and more."
    },
    {
      question: "How can I report potentially fake news?",
      answer: "You can use the 'Report' button on any news article to flag content for review. Our team will investigate the report and update the article's verification status accordingly."
    },
    {
      question: "How often is the news feed updated?",
      answer: "Our news feed is updated in real-time as new articles are published and verified. We continuously monitor trusted news sources to provide the latest information."
    },
    {
      question: "Can I customize my news feed?",
      answer: "Yes, you can customize your news feed by selecting preferred categories, following specific topics, and saving trusted sources. Your preferences will help us show you more relevant content."
    }
  ];

  return (
    <div className="min-h-screen pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <motion.a
            href="/contact"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}