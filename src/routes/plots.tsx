import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/plots")({
  head: () => ({ meta: [{ title: "My Plots · AgroSense" }, { name: "description", content: "My Plots in AgroSense." }, { property: "og:title", content: "My Plots · AgroSense" }, { property: "og:description", content: "My Plots in AgroSense." }] }),
  component: makeStub("My Plots"),
});
