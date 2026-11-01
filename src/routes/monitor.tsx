import { createFileRoute } from "@tanstack/react-router";
import { MonitoringPage } from "@/pages/Monitoring/MonitoringPage";
export const Route = createFileRoute("/monitor")({
  head: () => ({ meta: [{ title: "Live Monitoring · AgroSense" }, { name: "description", content: "Real-time soil, temperature, humidity and rain sensors." }, { property: "og:title", content: "Live Monitoring · AgroSense" }, { property: "og:description", content: "Real-time soil, temperature, humidity and rain sensors." }] }),
  component: MonitoringPage,
});
