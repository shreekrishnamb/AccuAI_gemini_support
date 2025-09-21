
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Languages, Book, BotMessageSquare, Mail } from "lucide-react";
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
              <Mail className="text-primary" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Have questions or feedback? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <a href="mailto:contact@accuai.com">
                <Button className="w-full" variant="outline">Get in Touch</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
