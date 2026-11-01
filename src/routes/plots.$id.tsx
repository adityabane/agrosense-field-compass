import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/plots/$id")({
  head: () => ({ meta: [{ title: "Plot Details · AgroSense" }, { name: "description", content: "Plot sensor and crop details." }, { property: "og:title", content: "Plot Details · AgroSense" }, { property: "og:description", content: "Plot sensor and crop details." }] }),
  component: makeStub("Plot details"),
});
