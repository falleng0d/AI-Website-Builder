import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";

export function ChatStopButton(props: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={props.onClick}>
      <Square className="h-4 w-4" /> Stop
    </Button>
  );
}
