"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import type { ModelOption } from "@/hooks/use-chat-models";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ChatModelSelectorProps = {
  models: readonly ModelOption[];
  selectedModelId: string;
  disabled?: boolean;
  onSelectModelAction: (modelId: string) => void;
};

function getModelProvider(modelId: string): string | undefined {
  const match = modelId.match(/^([a-z0-9-]+)[/:]/i);
  return match?.[1]?.toLowerCase();
}

export function ChatModelSelector({ models, selectedModelId, disabled, onSelectModelAction }: ChatModelSelectorProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const selectedModel = useMemo(
    () =>
      models.find((model) => model.id === selectedModelId) ?? {
        id: selectedModelId,
        name: selectedModelId,
      },
    [models, selectedModelId],
  );

  const selectedProvider = getModelProvider(selectedModel.id);

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button className="max-w-[min(18vw,22rem)] justify-between gap-2" disabled={disabled} variant="outline">
          <span className="flex min-w-0 items-center gap-2">
            {selectedProvider ? (
              <ModelSelectorLogo
                className="size-4 shrink-0 rounded-full bg-background p-px ring-1"
                provider={selectedProvider}
              />
            ) : (
              <Sparkles className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{selectedModel.name}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </ModelSelectorTrigger>

      <ModelSelectorContent className="sm:max-w-lg" title="Select a chat model">
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Available models">
            {models.map((model) => {
              const provider = getModelProvider(model.id);
              const isSelected = model.id === selectedModelId;

              return (
                <ModelSelectorItem
                  key={model.id}
                  onSelect={() => {
                    onSelectModelAction(model.id);
                    setOpen(false);
                  }}
                  value={model.id}
                >
                  {provider ? (
                    <ModelSelectorLogo
                      className="size-4 shrink-0 rounded-full bg-background p-px ring-1"
                      provider={provider}
                    />
                  ) : (
                    <Sparkles className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                    <p className="truncate text-xs text-muted-foreground">{model.description?.trim() || model.id}</p>
                  </div>
                  {isSelected ? <Check className="size-4 text-primary" /> : null}
                </ModelSelectorItem>
              );
            })}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
