
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const features = [
    'Real-time speech and text translation',
    'AI-powered contextual analysis',
    'Support for over 15 languages',
    'Personal phrasebook savings',
    'Interactive common phrases',
    'Intuitive and modern user interface',
  ];

  const techStack = [
    { name: 'Next.js', description: 'For server-side rendering and routing.' },
    { name: 'React', description: 'For building the user interface.' },
    { name: 'Genkit', description: 'For powerful, integrated AI capabilities with Gemini.' },
    { name: 'shadcn/ui', description: 'For pre-built, accessible UI components.' },
    { name: 'Tailwind CSS', description: 'For modern and responsive styling.' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">About AccuAI</h1>
      <p className="text-lg text-muted-foreground mb-8">
        AccuAI is a cutting-edge translation application designed to bridge
        communication gaps through the power of artificial intelligence. Our mission is
        to provide accurate, context-aware translations that feel natural and
        intuitive.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {techStack.map((tech) => (
            <div key={tech.name}>
              <h3 className="font-semibold">{tech.name}</h3>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
