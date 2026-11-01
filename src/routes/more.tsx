import { createFileRoute } from "@tanstack/react-router";
import { MorePage } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "More · AgroSense" }, { name: "description", content: "All AgroSense sections." }, { property: "og:title", content: "More · AgroSense" }, { property: "og:description", content: "All AgroSense sections." }] }),
  component: MorePage,
});
