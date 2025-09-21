
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AppLayout from "../(app)/layout";

const blogPosts = [
  {
    title: "The Power of AI in Real-Time Translation",
    date: "October 26, 2023",
    excerpt: "Artificial intelligence is revolutionizing how we communicate across languages. Explore the technology behind instant speech and text translation...",
  },
  {
    title: "5 Common Pitfalls to Avoid in Machine Translation",
    date: "October 20, 2023",
    excerpt: "While powerful, machine translation isn't perfect. Here are five common mistakes to look out for and how to correct them for better accuracy.",
  },
  {
    title: "Understanding Cultural Nuances in Language",
    date: "October 15, 2023",
    excerpt: "Translation is more than just words. It's about conveying meaning, which is deeply tied to culture. Let's dive into the importance of cultural context.",
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
                <Button variant="link" className="px-0 mt-2">Read more &rarr;</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
