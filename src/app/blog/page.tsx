
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AppLayout from "../(app)/layout";
import { blogPosts } from "@/lib/blog-posts";

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
          {blogPosts.map((post) => (
            <Card key={post.slug} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                 <Button asChild variant="link" className="px-0 mt-2">
                   <Link href={`/blog/${post.slug}`}>
                    Read more &rarr;
                   </Link>
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
