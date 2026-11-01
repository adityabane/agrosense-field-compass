import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/automation")({
  head: () => ({ meta: [{ title: "Automation Settings · AgroSense" }, { name: "description", content: "Automation Settings in AgroSense." }, { property: "og:title", content: "Automation Settings · AgroSense" }, { property: "og:description", content: "Automation Settings in AgroSense." }] }),
  component: makeStub("Automation Settings"),
});
