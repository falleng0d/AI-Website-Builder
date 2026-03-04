import { authClient } from "@/lib/auth-client";

export const signInWithGithub = async () => {
   await authClient.signIn.social({
      provider: "github"
   })
}
