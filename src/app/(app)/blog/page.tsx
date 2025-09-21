
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

const blogPosts = [
  {
    id: '1',
    title: 'The Unseen Power of AI in Modern Translation',
    description: 'Explore how machine learning models are breaking down language barriers like never before.',
    date: 'October 26, 2023',
    author: 'Jane Doe',
    imageUrl: 'https://picsum.photos/seed/blog1/600/400',
    imageHint: 'technology abstract',
  },
  {
    id: '2',
    title: 'Beyond Words: Understanding Cultural Nuances in Translation',
    description: 'A deep dive into why context and culture are critical for accurate communication.',
    date: 'October 22, 2023',
    author: 'John Smith',
    imageUrl: 'https://picsum.photos/seed/blog2/600/400',
    imageHint: 'culture diversity',
  },
  {
    id: '3',
    title: 'Top 5 Languages to Learn for Global Business in 2024',
    description: 'An analysis of emerging economic trends and the languages that will open doors for you.',
    date: 'October 19, 2023',
    author: 'Emily White',
    imageUrl: 'https://picsum.photos/seed/blog3/600/400',
    imageHint: 'business meeting',
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">AccuAI Blog</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Insights on AI, language, and the future of communication.
      </p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
             <div className="relative w-full h-48">
                <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={post.imageHint}
                />
            </div>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.date} by {post.author}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{post.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="p-0">
                <Link href="#">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
