
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AppLayout from "../(app)/layout";

const blogPosts = [
  {
    title: "The Power of AI in Real-Time Translation",
    date: "October 26, 2023",
    excerpt: "Artificial intelligence is revolutionizing how we communicate across languages. Explore the technology behind instant speech and text translation...",
    content: "Artificial intelligence is at the heart of modern translation services. Unlike older rule-based systems, AI models like Google's Gemini are trained on vast amounts of text and can understand the nuances of language, context, and intent. This allows for translations that are not only grammatically correct but also culturally appropriate. Our app leverages these capabilities to provide real-time feedback and translations, making cross-lingual communication more seamless than ever before."
  },
  {
    title: "5 Common Pitfalls to Avoid in Machine Translation",
    date: "October 20, 2023",
    excerpt: "While powerful, machine translation isn't perfect. Here are five common mistakes to look out for and how to correct them for better accuracy.",
    content: "Machine translation is a powerful tool, but it's important to be aware of its limitations. Common pitfalls include: 1) Literal translations that miss idiomatic expressions. 2) Incorrectly handling slang or informal language. 3) Misinterpreting context, leading to ambiguity. 4) Grammatical errors in complex sentences. 5) Lack of cultural nuance. By being mindful of these issues and using AI tools to ask for clarification, you can achieve much higher accuracy."
  },
  {
    title: "Understanding Cultural Nuances in Language",
    date: "October 15, 2023",
    excerpt: "Translation is more than just words. It's about conveying meaning, which is deeply tied to culture. Let's dive into the importance of cultural context.",
    content: "Effective communication goes beyond simply swapping words from one language to another. Culture shapes how we express ourselves, from formal address to humor and figures of speech. A direct translation might be grammatically correct but socially awkward or even offensive. That's why AccuAI includes features to ask about the context of a translation, helping you understand not just what is being said, but what is truly meant."
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
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{post.title}</DialogTitle>
                      <DialogDescription>{post.date}</DialogDescription>
                    </DialogHeader>
                    <div className="prose max-w-none prose-sm sm:prose-base">
                      {post.content}
                    </div>
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
