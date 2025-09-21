
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Cpu, Dna, Rocket, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "../(app)/layout";

const techStack = [
  {
    name: "Next.js",
    description: "The React framework for building fast and scalable web applications.",
    icon: <Rocket className="h-6 w-6 text-primary" />,
  },
  {
    name: "Genkit",
    description: "An open-source framework for building production-ready AI-powered apps.",
    icon: <Dna className="h-6 w-6 text-primary" />,
  },
  {
    name: "Google Gemini",
    description: "The powerful AI model used for translation, transcription, and contextual understanding.",
    icon: <Cpu className="h-6 w-6 text-primary" />,
  },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div className="flex justify-start">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">About AccuAI</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Bridging communication gaps with the power of artificial intelligence.
          </p>
        </div>
        
        <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-xl">
             <Image
                src="https://picsum.photos/seed/technology/1200/600"
                alt="Abstract technology"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="technology abstract"
                priority
              />
          </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-foreground/90 space-y-6">
           <p>
              AccuAI is a demonstration project built to showcase the capabilities of modern AI in the realm of real-time language translation. Our goal is to provide a tool that is not only accurate but also intuitive and helpful, allowing users to understand the context and nuances of language, not just the words. This project serves as a practical example for academic purposes, illustrating a full-stack application built with a modern, AI-first technology stack.
            </p>
             <div className="space-y-2 !mt-10">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    Our Commitment to Privacy
                </h3>
                <p>
                  We believe in privacy by design. AccuAI does not require you to create an account or log in. All AI processing is done anonymously, and your translation history is not stored on our servers. Any phrases you choose to save are stored locally on your own device, ensuring that you are the only one with access to them.
                </p>
            </div>
        </div>
        
        <div className="text-center pt-8">
            <h2 className="text-3xl font-bold tracking-tight">Technology Stack</h2>
            <p className="mt-2 text-md text-muted-foreground">The core components that power AccuAI.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {techStack.map((tech) => (
            <Card key={tech.name} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-2">{tech.icon}</div>
                <CardTitle>{tech.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
