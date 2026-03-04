import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "../route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession(req);
  if (!session) return response;

  const { id } = await params;

  const todo = await prisma.todo.findUnique({
    where: { id },
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
          completed: true,
        },
      },
    },
  });

  if (!todo) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(todo);
}

const TodoUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  completed: z.boolean().optional(),
  parentId: z.uuidv4().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession(req);
  if (!session) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = TodoUpdateSchema.parse(body);

  const todo = await prisma.todo.update({
    where: { id },
    data: parsed,
  });

  return NextResponse.json(todo);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession(req);
  if (!session) return response;

  const { id } = await params;

  await prisma.todo.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
