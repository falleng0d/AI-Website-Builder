import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProvider } from "@/context/UserContext";

export default async function RootGroupLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   const session = await auth.api.getSession({
      headers: await headers()
   });
   const user = session?.user ?? null;
   return (
      <UserProvider user={user}>
         {children}
      </UserProvider>
   );
}
