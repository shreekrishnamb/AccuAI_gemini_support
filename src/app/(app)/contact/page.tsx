
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-2">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:contact@accuai.com" className="hover:underline">contact@accuai.com</a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span>123 AI Avenue, Tech City, 12345</span>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." />
            </div>
            <Button type="submit" disabled>Submit (Disabled)</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
