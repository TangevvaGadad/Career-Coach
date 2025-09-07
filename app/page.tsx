"use client"
import HeroSection from "@/components/hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/data/features";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  // Trophy,
  // Target,
  // Sparkles,
  // CheckCircle2,
} from "lucide-react";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";


export default function page() {

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const stats = [
    { value: "50+", label: "Industries Covered" },
    { value: "1000+", label: "Interview Questions" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "AI Support" },
  ];
  return (
    <div>
      <div className="grid-background">
      </div>

            {/* Hero Section */}
            <HeroSection />
{/* features */}
<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
          Powerful Features for Your Career Growth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="border-2 hover:border-primary transition-colors duration-300">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center">
                    {feature.icon}
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

          {/* Stats Section */}
          <section className="w-full py-12 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={statVariants}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <h3 className="text-4xl font-bold">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

{/* How It Works Section */}
<section className="w-full py-12 md:py-24 bg-background">
  <div className="container mx-auto px-4 md:px-6">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-12"
    >
      <h2 className="text-3xl font-bold mb-4">How It Works</h2>
      <p className="text-muted-foreground">
        Four simple steps to accelerate your career growth
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {howItWorks.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {item.icon}
          </div>
          <h3 className="font-semibold text-xl">{item.title}</h3>
          <p className="text-muted-foreground">{item.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>



<section className="w-full py-12 md:py-24 bg-muted/50 overflow-hidden">
  <div className="container mx-auto px-4 md:px-6">
    <h2 className="text-3xl font-bold text-center mb-12">
      What Our Users Say
    </h2>

    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex w-max space-x-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 30, // slower motion
          ease: "linear",
        }}
      >
        {/* Duplicate testimonials to ensure seamless loop */}
        {[...testimonial, ...testimonial].map((t, index) => (
          <div key={index} className="w-80 flex-shrink-0">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image
                        width={40}
                        height={40}
                        src={t.image}
                        alt={t.author}
                        className="rounded-full object-cover border-2 border-primary/20"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{t.author}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                      <p className="text-sm text-primary">{t.company}</p>
                    </div>
                  </div>
                  <blockquote>
                    <p className="text-muted-foreground italic relative">
                      <span className="text-3xl text-primary absolute -top-4 -left-2">
                        &quot;
                      </span>
                      {t.quote}
                      <span className="text-3xl text-primary absolute -bottom-4">
                        &quot;
                      </span>
                    </p>
                  </blockquote>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
</section>


{/*  FAQ Section */}
<section className="w-full py-12 md:py-24">
  <div className="container mx-auto px-4 md:px-6">
    <motion.div
      className="text-center max-w-3xl mx-auto mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-muted-foreground">
        Find answers to common questions about our platform
      </p>
    </motion.div>

    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <AccordionItem value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="w-full">
        <div className="mx-auto py-24 gradient rounded-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                variant="secondary"
                className="h-11 mt-5 animate-bounce"
              >
                Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </div>

  );
}

