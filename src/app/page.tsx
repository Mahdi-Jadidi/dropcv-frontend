import { redirect } from "next/navigation";

// DropCV landing page lives as a static HTML file in /public/index.html.
// Redirect the root route to it so the existing DropCV work (landing page,
// login, signup, dashboards, discovery, directory) is served as-is while we
// continue migrating pieces into proper Next.js / React components.
export default function Home() {
  redirect("/index.html");
}
