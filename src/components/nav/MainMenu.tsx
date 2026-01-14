import MenuClient from "./MenuClient";

export default async function MainMenu() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/menu?key=primary`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };

  return <MenuClient tree={data.items || []} />;
}
