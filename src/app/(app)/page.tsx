
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Languages, Book, BotMessageSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to AccuAI</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your intelligent translation companion.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="text-primary" />
              Live Translation
            </CardTitle>
            <CardDescription>
              Translate speech and text in real-time with high accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/translate">
              <Button className="w-full">Start Translating</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BotMessageSquare className="text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Ask questions about your translations to understand context and nuance.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/translate">
                <Button className="w-full" variant="outline">Explore AI Features</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="text-primary" />
              Language Blog
            </CardTitle>
            <CardDescription>
              Read our latest articles about AI, language, and culture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog">
              <Button className="w-full" variant="outline">Visit Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">Usage Statistics (Dummy Data)</h2>
          <div className="grid gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader>
                      <CardTitle>Translations Today</CardTitle>
                      <CardDescription className="text-4xl font-bold text-primary">1,204</CardDescription>
                  </CardHeader>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle>Phrases Saved</CardTitle>
                      <CardDescription className="text-4xl font-bold text-primary">88</CardDescription>
                  </CardHeader>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle>Most Used Language</CardTitle>
                      <CardDescription className="text-4xl font-bold text-primary">Spanish</CardDescription>
                  </CardHeader>
              </Card>
          </div>
      </div>
    </div>
  )
}
