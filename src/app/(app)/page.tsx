
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Languages, Book, BotMessageSquare, Mail, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to AccuAI</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your intelligent, private translation companion.</p>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
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
                Blog
              </CardTitle>
              <CardDescription>
                Read our latest articles on AI, languages, and translation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/blog">
                  <Button className="w-full" variant="outline">Read Blog</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="text-primary" />
                About AccuAI
              </CardTitle>
              <CardDescription>
                Learn more about the project and the technology behind it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/about">
                  <Button className="w-full" variant="outline">About Page</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <ShieldCheck className="text-primary" />
                Your Privacy, Respected.
              </CardTitle>
              <CardDescription>
                No login, no tracking, no accounts. Your translation data is never stored.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Mail className="text-primary" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Have questions or feedback? We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <a href="mailto:contact@accuai.com">
                  <Button className="w-full" variant="outline">Get in Touch</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
