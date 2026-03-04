import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";

export default function HomeShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[450px] w-full sm:h-[500px] md:h-[550px] lg:h-[800px]">
        <StarsBackground className="h-full w-full" />
      </div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
