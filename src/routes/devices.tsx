import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [{ title: "Device Management · AgroSense" }, { name: "description", content: "Device Management in AgroSense." }, { property: "og:title", content: "Device Management · AgroSense" }, { property: "og:description", content: "Device Management in AgroSense." }] }),
  component: makeStub("Device Management"),
});
