import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/pages/Analytics/AnalyticsPage";
export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Water Analytics · AgroSense" }, { name: "description", content: "Estimated water consumption trends." }, { property: "og:title", content: "Water Analytics · AgroSense" }, { property: "og:description", content: "Estimated water consumption trends." }] }),
  component: AnalyticsPage,
});
