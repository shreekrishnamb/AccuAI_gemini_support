
"use client";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "../(app)/layout";

const blogPosts = [
  {
    title: "The Power of AI in Real-Time Translation",
    date: "October 26, 2023",
    excerpt: "Artificial intelligence is revolutionizing how we communicate across languages. Explore the technology behind instant speech and text translation...",
    content: "Artificial intelligence is at the heart of modern translation services. Unlike older rule-based systems that followed rigid grammatical structures, modern AI models like Google's Gemini are built on neural networks. These networks are trained on vast amounts of multilingual text and can understand the nuances of language, context, and intent. This allows for translations that are not only grammatically correct but also culturally appropriate and natural-sounding. Our app leverages these capabilities to provide real-time feedback and translations, making cross-lingual communication more seamless and effective than ever before. The model can even detect the source language automatically, which simplifies the user experience significantly. This project uses Genkit, an open-source framework from Google, which makes it easy to build production-ready AI-powered features. By defining flows and prompts, we can structure our interactions with the AI model in a clear and maintainable way, enabling complex features like real-time transcription and contextual questioning.",
    imageUrl: "https://picsum.photos/seed/ai-brain/600/400",
    imageHint: "AI brain",
  },
  {
    title: "5 Common Pitfalls in Machine Translation (and How to Avoid Them)",
    date: "October 20, 2023",
    excerpt: "While powerful, machine translation isn't perfect. Here are five common mistakes to look out for and how to correct them for better accuracy.",
    content: "Machine translation is a powerful tool, but it's important to be aware of its limitations to avoid misunderstandings. Common pitfalls include: 1) Literal translations that completely miss idiomatic expressions (e.g., translating 'it's raining cats and dogs' literally). 2) Incorrectly handling slang or informal language, which can lead to awkward or nonsensical output. 3) Misinterpreting context, causing ambiguity, especially with words that have multiple meanings. 4) Grammatical errors in complex sentences with multiple clauses. 5) A lack of cultural nuance, which can make a translation socially awkward or even offensive. By being mindful of these issues and using AI tools like AccuAI to ask for clarification or alternative phrasings, you can achieve much higher accuracy and more effective communication. The 'Ask About Translation' feature in this app is designed to tackle this exact problem, allowing you to probe the AI for context and alternatives.",
    imageUrl: "https://picsum.photos/seed/translation-error/600/400",
    imageHint: "translation error",
  },
  {
    title: "Understanding Cultural Nuances in Language",
    date: "October 15, 2023",
    excerpt: "Translation is more than just words. It's about conveying meaning, which is deeply tied to culture. Let's dive into the importance of cultural context.",
    content: "Effective communication goes beyond simply swapping words from one language to another. Culture shapes how we express ourselves, from formal and informal modes of address (like 'tú' vs. 'usted' in Spanish) to humor, sarcasm, and figures of speech. A direct translation might be grammatically correct but could be socially inappropriate or fail to capture the intended tone. For instance, a friendly joke in one culture might not land the same way in another. That's why AccuAI includes the 'Ask about the translation' feature. It empowers you to understand not just *what* is being said, but *how* it's being said and *what is truly meant* within a given cultural context. This ability to query the model about cultural specifics is a key advantage of using a powerful large language model like Gemini for translation.",
    imageUrl: "https://picsum.photos/seed/culture-flags/600/400",
    imageHint: "culture flags",
  },
];

export default function BlogPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-start">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">AccuAI Blog</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Insights on AI, language, and the future of communication.
          </p>
        </div>

        <div className="grid gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 mt-2">Read more &rarr;</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{post.title}</DialogTitle>
                      <DialogDescription>{post.date}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="pr-4 -mr-6">
                      <div className="prose max-w-none prose-sm sm:prose-base mt-4">
                        <div className="flex justify-center">
                          <Image 
                            src={post.imageUrl} 
                            alt={post.title} 
                            width={400} 
                            height={267} 
                            className="rounded-lg mb-4"
                            data-ai-hint={post.imageHint}
                          />
                        </div>
                        <p>{post.content}</p>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
