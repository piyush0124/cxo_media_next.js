import PostEditorWp from "@/components/admin/PostEditor";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <PostEditorWp mode="create" categories={categories} />;
}
