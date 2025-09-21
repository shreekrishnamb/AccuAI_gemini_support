
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/app/(app)/layout';
import { blogPosts, type BlogPost } from '@/lib/blog-posts';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Split content by newline characters for paragraph rendering
  const paragraphs = post.content.split('\n\n');

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <article className="prose prose-lg max-w-none dark:prose-invert">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{post.date}</p>
          
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-xl">
             <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={post.imageHint}
                priority
              />
          </div>

          <div className="space-y-6 text-foreground/90">
            {paragraphs.map((p, index) => (
              <p key={index}>{p}</p>
            ))}
          </div>

        </article>
      </div>
    </AppLayout>
  );
}

// Optional: Generate static pages for each blog post for better performance
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}
