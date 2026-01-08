import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/admin/PostEditor";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <PostEditor mode="edit" initial={post} categories={categories} />;
}
