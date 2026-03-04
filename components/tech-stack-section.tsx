import { Code, Database, Layers, Lock, Zap } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import FadeInView from './animate-ui/fade-in-view';


const stack = [
   {
      name: "Next.js 15",
      icon: <Zap className="h-6 w-6 text-primary" />,
      description: "The latest version of the React framework with improved performance and features",
   },
   {
      name: "Tailwind CSS",
      icon: <Code className="h-6 w-6 text-blue-500" />,
      description: "Utility-first CSS framework for rapid UI development",
   },
   {
      name: "Shadcn UI",
      icon: <Layers className="h-6 w-6 text-sky-500" />,
      description: "Beautifully designed components built with Radix UI and Tailwind",
   },
   {
      name: "Better-Auth",
      icon: <Lock className="h-6 w-6 text-primary" />,
      description: "Advanced authentication library with built-in security features",
   },
   {
      name: "Prisma",
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      description: "Next-gen ORM for Node.js and TypeScript",
   },
   {
      name: "PostgreSQL",
      icon: <Database className="h-6 w-6 text-blue-600" />,
      description: "Powerful, open source object-relational database system",
   },
]

export default function TechStackSection() {

   return (
      <section className="pb-20 pt-20 md:pb-32 md:pt-32 container mx-auto">
         <FadeInView className="text-center space-y-4 pb-16 mx-auto max-w-4xl">
            <Badge className='px-4 py-1.5 text-sm font-medium'>Tech Stack</Badge>
            <h2 className="mx-auto mt-4 text-3xl font-bold sm:text-5xl tracking-tight">
               Powered by Modern Technology
            </h2>
            <p className="text-xl text-muted-foreground pt-1">

            </p>
         </FadeInView>
      </section>
   )
}
