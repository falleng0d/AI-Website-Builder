"use client"

import { Button } from "@/components/ui/button";
import { ExternalLink, Github, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import FadeInView from "./animate-ui/fade-in-view";

export default function HeroSection() {
   return (
      <section className="relative space-y-6 py-8 md:py-12 lg:py-40">
         <div className="container flex flex-col items-center gap-4 text-center">
            <FadeInView className="container flex flex-col items-center gap-4 text-center">
               <Badge className=" px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="mr-2 size-8" />
                  Open Source AI Website Builder
               </Badge>
            </FadeInView>
            <FadeInView delay={0.2} className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
               AI Website Builder <br />
               <span className="text-transparent px-2 bg-gradient-to-r from-primary bg-clip-text">Starter Template</span>
            </FadeInView>
            <FadeInView delay={0.4} className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
               A complete, open-source website builder that lets you build and update your site by just talking to AI in your own language.
            </FadeInView>
            <FadeInView delay={0.6} className="flex flex-wrap items-center justify-center gap-4">
               <Button size="lg" asChild>
                  <Link href="/chat" className="flex items-center gap-2">
                     <MessageSquare className="h-4 w-4" />
                     <span>Open AI Chat</span>
                  </Link>
               </Button>
               <Button variant="outline" size="lg" asChild>
                  <Link href="/sign-up" className="flex items-center gap-2">
                     <ExternalLink className="h-4 w-4" />
                     <span>Login</span>
                  </Link>
               </Button>
            </FadeInView>
         </div>
      </section>
   );
}
