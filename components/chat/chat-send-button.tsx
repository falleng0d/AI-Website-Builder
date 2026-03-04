"use client";

import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

type ChatSendButtonProps = {
  disabled: boolean;
};

export function ChatSendButton({ disabled }: ChatSendButtonProps) {
  return (
    <Button type="submit" disabled={disabled}>
      <SendHorizontal className="h-4 w-4" />
      Send
    </Button>
  );
}
