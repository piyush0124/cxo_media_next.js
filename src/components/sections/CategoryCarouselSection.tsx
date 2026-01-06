import Carousel from "@/components/ui/Carousel";
import StoryCard from "@/components/cards/StoryCard";

export default function CategoryCarouselSection({
  title,
  posts,
}: {
  title: string;
  posts: any[];
}) {
  if (!posts?.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between border-b pb-2 mb-4">
        <h2 className="text-xl font-serif tracking-wide">{title}</h2>
        <a className="text-sm text-gray-600 hover:underline" href="#">
          View all →
        </a>
      </div>

      <Carousel>
        {posts.map((p) => (
          <StoryCard key={p.id} post={p} />
        ))}
      </Carousel>
    </section>
  );
}
