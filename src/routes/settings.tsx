import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · AgroSense" }, { name: "description", content: "Settings in AgroSense." }, { property: "og:title", content: "Settings · AgroSense" }, { property: "og:description", content: "Settings in AgroSense." }] }),
  component: makeStub("Settings"),
});
