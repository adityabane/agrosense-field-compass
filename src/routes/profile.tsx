import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · AgroSense" }, { name: "description", content: "Profile in AgroSense." }, { property: "og:title", content: "Profile · AgroSense" }, { property: "og:description", content: "Profile in AgroSense." }] }),
  component: makeStub("Profile"),
});
