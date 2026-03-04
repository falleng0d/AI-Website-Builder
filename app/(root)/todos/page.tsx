"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface Todo {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
}

export default function TodosPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchTodos();
    }
  }, [session]);

  async function fetchTodos() {
    try {
      const res = await fetch("/api/todo");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodoName.trim()) return;

    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTodoName.trim() }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos([todo, ...todos]);
        setNewTodoName("");
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      const res = await fetch(`/api/todo/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  if (isPending || loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Todos</h1>

      <form onSubmit={createTodo} className="flex gap-2 mb-6">
        <Input
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="space-y-3">
        {todos.map((todo) => (
          <Card key={todo.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    className="h-5 w-5 cursor-pointer"
                  />
                  <CardTitle
                    className={`text-base ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    <Link href={`/todos/${todo.id}`} className="hover:underline">
                      {todo.name}
                    </Link>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {todo.children.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {todo.children.length} subtask
                      {todo.children.length > 1 ? "s" : ""}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {todos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No todos yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}
