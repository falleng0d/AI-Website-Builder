"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface Todo {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string; completed: boolean }[];
}

export default function TodoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, isPending } = authClient.useSession();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session && id) {
      fetchTodo();
    }
  }, [session, id]);

  async function fetchTodo() {
    try {
      const res = await fetch(`/api/todo/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTodo(data);
      } else if (res.status === 404) {
        router.push("/todos");
      }
    } catch (error) {
      console.error("Failed to fetch todo:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTodo() {
    if (!todo) return;
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodo(updated);
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  async function createSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newChildName.trim() || !todo) return;

    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildName.trim(),
          parentId: todo.id,
        }),
      });
      if (res.ok) {
        const child = await res.json();
        setTodo({
          ...todo,
          children: [...todo.children, child],
        });
        setNewChildName("");
      }
    } catch (error) {
      console.error("Failed to create subtask:", error);
    }
  }

  async function deleteTodo() {
    if (!todo) return;
    try {
      const res = await fetch(`/api/todo/${todo.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/todos");
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  async function toggleChild(child: Todo["children"][0]) {
    if (!todo) return;
    try {
      const res = await fetch(`/api/todo/${child.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !child.completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodo({
          ...todo,
          children: todo.children.map((c) =>
            c.id === child.id ? updated : c
          ),
        });
      }
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  }

  async function deleteChild(childId: string) {
    if (!todo) return;
    try {
      const res = await fetch(`/api/todo/${childId}`, { method: "DELETE" });
      if (res.ok) {
        setTodo({
          ...todo,
          children: todo.children.filter((c) => c.id !== childId),
        });
      }
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  }

  if (isPending || loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!session || !todo) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Link href="/todos" className="text-sm text-muted-foreground mb-4 block">
        &larr; Back to todos
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={toggleTodo}
                className="h-5 w-5 cursor-pointer"
              />
              <CardTitle
                className={todo.completed ? "line-through text-muted-foreground" : ""}
              >
                {todo.name}
              </CardTitle>
            </div>
            <Button variant="destructive" size="sm" onClick={deleteTodo}>
              Delete
            </Button>
          </div>
        </CardHeader>
        {todo.parent && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Parent:{" "}
              <Link href={`/todos/${todo.parent.id}`} className="hover:underline">
                {todo.parent.name}
              </Link>
            </p>
          </CardContent>
        )}
      </Card>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Subtasks</h2>
        <form onSubmit={createSubtask} className="flex gap-2 mb-4">
          <Input
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1"
          />
          <Button type="submit">Add</Button>
        </form>

        <div className="space-y-2">
          {todo.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={child.completed}
                  onChange={() => toggleChild(child)}
                  className="h-4 w-4 cursor-pointer"
                />
                <Link
                  href={`/todos/${child.id}`}
                  className={`hover:underline ${
                    child.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {child.name}
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteChild(child.id)}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          ))}
          {todo.children.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No subtasks yet. Add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
