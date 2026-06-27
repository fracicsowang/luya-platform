import { L } from "@/lib/i18n";
import { Workflow } from "@/lib/types";
import { PageHeader } from "./PageHeader";
import { WorkflowDiagram } from "./WorkflowDiagram";

/**
 * Standard module page: a header, the module's data, and — beside it — the
 * workflow diagram, so PMs and engineers read the same picture.
 *  - layout "side": workflow sits in a sticky right rail (linear flows).
 *  - layout "top":  workflow spans full width above the data (wide/split flows).
 */
export function ModuleShell({
  title,
  desc,
  pillar,
  workflow,
  workflows,
  layout = "side",
  kpis,
  children,
}: {
  title: L;
  desc?: L;
  pillar?: L;
  workflow?: Workflow;
  workflows?: Workflow[];
  layout?: "side" | "top";
  kpis?: React.ReactNode;
  children: React.ReactNode;
}) {
  const flows = workflows ?? (workflow ? [workflow] : []);

  return (
    <div>
      <PageHeader title={title} desc={desc} pillar={pillar} />
      {kpis ? <div className="mb-6">{kpis}</div> : null}

      {layout === "top" ? (
        <div className="space-y-6">
          {flows.map((wf) => (
            <WorkflowDiagram key={wf.id} wf={wf} />
          ))}
          {children}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6 items-start">
          <div className="min-w-0 space-y-6">{children}</div>
          <div className="space-y-6 xl:sticky xl:top-16">
            {flows.map((wf) => (
              <WorkflowDiagram key={wf.id} wf={wf} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
