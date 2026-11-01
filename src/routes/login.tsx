import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/pages/Stub/StubPage";
export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · AgroSense" }, { name: "description", content: "Sign in in AgroSense." }, { property: "og:title", content: "Sign in · AgroSense" }, { property: "og:description", content: "Sign in in AgroSense." }] }),
  component: makeStub("Sign in"),
});
