import { Link } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/ui/agro";
import { moreNav } from "@/components/layout/nav";
export function makeStub(title: string) {
  return function Stub() {
    return (<><PageHeader title={title} /><EmptyState title="Coming soon" description="This section is not built yet." /></>);
  };
}
export function MorePage() {
  return (<><PageHeader title="More" /><div className="grid gap-2">{moreNav.map((n) => (
    <Link key={n.to} to={n.to} className="flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 font-medium"><n.icon className="size-5 text-primary" />{n.label}</Link>))}</div></>);
}
