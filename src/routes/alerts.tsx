import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts · AgroSense" }, { name: "description", content: "Alerts in AgroSense." }, { property: "og:title", content: "Alerts · AgroSense" }, { property: "og:description", content: "Alerts in AgroSense." }] }),
  component: makeStub("Alerts"),
});
