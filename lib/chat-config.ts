import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";

const STORAGE_KEY = "chat-workspace-config";

type PersistedStorageObject = Record<string, unknown>;

function isStorageObject(value: unknown): value is PersistedStorageObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStorageObject(): PersistedStorageObject {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return isStorageObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorageObject(value: PersistedStorageObject): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

function loadPersistedValue<TSchema extends z.ZodTypeAny>(
  key: string,
  schemaWithDefaultValue: TSchema,
  defaultValue: z.infer<TSchema>,
): z.infer<TSchema> {
  const stored = readStorageObject();
  const parsed = schemaWithDefaultValue.safeParse(stored[key]);
  return parsed.success ? parsed.data : defaultValue;
}

export function usePersistedState<TSchema extends z.ZodTypeAny>(
  key: string,
  schemaWithDefaultValue: TSchema,
): [z.infer<TSchema>, Dispatch<SetStateAction<z.infer<TSchema>>>] {
  const defaultValue = useMemo(() => schemaWithDefaultValue.parse(undefined), [schemaWithDefaultValue]);
  const [state, setState] = useState<z.infer<TSchema>>(() => loadPersistedValue(key, schemaWithDefaultValue, defaultValue));

  const setPersistedState = useCallback<Dispatch<SetStateAction<z.infer<TSchema>>>>(
    (value) => {
      setState((current) => {
        const nextState =
          typeof value === "function" ? (value as (previousState: z.infer<TSchema>) => z.infer<TSchema>)(current) : value;
        const stored = readStorageObject();
        writeStorageObject({ ...stored, [key]: nextState });
        return nextState;
      });
    },
    [key],
  );

  return [state, setPersistedState];
}
