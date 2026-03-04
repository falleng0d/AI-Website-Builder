// List all todos
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function GET() {
  const todos = await prisma.todo.findMany({
      select: {
        id: true,
        name: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  );

  return new Response(JSON.stringify(todos), {
    status: 200,
  });
}

export const TodoCreateOneSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  completed: z.boolean().optional(),
  parentId: z.uuidv4().optional().nullable(),
}).strict();

export type TodoCreateOneInput = z.infer<typeof TodoCreateOneSchema>;

export async function requireSession(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return {
      session: null,
      response: new NextResponse("Unauthorized", { status: 401 })
    };
  }
  return { session, response: null };
}

// Create a new todo
export async function POST(req: Request) {
  const { session, response } = await requireSession(req);
  if (!session) return response;

  const body: TodoCreateOneInput = await req.json();

  const parsed = TodoCreateOneSchema.parse(body);

  const todo = await prisma.todo.create({
    data: parsed,
  })

  console.log(`POST ${req.url} 201`, todo);

  return NextResponse.json(todo, { status: 201 });
}
