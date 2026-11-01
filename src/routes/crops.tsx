import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/crops")({
  head: () => ({ meta: [{ title: "Crop Management · AgroSense" }, { name: "description", content: "Crop Management in AgroSense." }, { property: "og:title", content: "Crop Management · AgroSense" }, { property: "og:description", content: "Crop Management in AgroSense." }] }),
  component: makeStub("Crop Management"),
});
