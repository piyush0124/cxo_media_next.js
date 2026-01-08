import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <PostEditor mode="create" categories={categories} />;
}