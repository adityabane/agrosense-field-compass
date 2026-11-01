import { createFileRoute } from "@tanstack/react-router";
import { IrrigationPage } from "@/pages/Irrigation/IrrigationPage";
export const Route = createFileRoute("/irrigation")({
  head: () => ({ meta: [{ title: "Irrigation Control · AgroSense" }, { name: "description", content: "Start, stop and monitor irrigation pumps." }, { property: "og:title", content: "Irrigation Control · AgroSense" }, { property: "og:description", content: "Start, stop and monitor irrigation pumps." }] }),
  component: IrrigationPage,
});
