import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "@/pages/Schedule/SchedulePage";
export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Irrigation Schedule · AgroSense" }, { name: "description", content: "Rule-based irrigation timeline." }, { property: "og:title", content: "Irrigation Schedule · AgroSense" }, { property: "og:description", content: "Rule-based irrigation timeline." }] }),
  component: SchedulePage,
});
