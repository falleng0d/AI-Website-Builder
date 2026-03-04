import React from "react";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none bg-gradient-to-br from-primary/30 to-primary/5 bg-clip-text text-[8rem] leading-none font-bold tracking-tighter text-transparent opacity-60 select-none md:text-[12rem] lg:text-[16rem]">
          AI WEBSITE BUILDER
        </div>
      </div>
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Website Builder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
