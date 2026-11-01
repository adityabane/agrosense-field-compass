import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/pages/Overview/OverviewPage";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · AgroSense" }, { name: "description", content: "Overview of your plots, water use and irrigation." }, { property: "og:title", content: "Dashboard · AgroSense" }, { property: "og:description", content: "Overview of your plots, water use and irrigation." }] }),
  component: OverviewPage,
});
