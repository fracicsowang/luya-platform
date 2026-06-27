"use client";

import { Actor, ACTOR_META, FlowStep, Workflow } from "@/lib/types";
import { TONE_CHIP, TONE_SOFT, Tone } from "@/lib/tone";
import { Bi, BiBlock, Card } from "./ui";
import { L } from "@/lib/i18n";

function ActorChip({ actor }: { actor: Actor }) {
  const meta = ACTOR_META[actor];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CHIP[meta.color as Tone]}`}>
      <Bi v={meta.label} />
    </span>
  );
}

function kindMark(kind?: string) {
  if (kind === "decision") return "◆";
  if (kind === "start") return "▶";
  if (kind === "end") return "■";
  if (kind === "system") return "⚙";
  return "";
}

function StepCard({ step, n }: { step: FlowStep; n?: number }) {
  const tone = ACTOR_META[step.actor].color as Tone;
  return (
    <div className={`rounded-lg border px-3 py-2 ${TONE_SOFT[tone]}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {n != null ? (
          <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${TONE_CHIP[tone]}`}>{n}</span>
        ) : null}
        <ActorChip actor={step.actor} />
        {step.kind ? <span className="text-xs text-gray-400">{kindMark(step.kind)}</span> : null}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900">
        <BiBlock v={step.title} />
      </div>
      {step.detail ? (
        <div className="mt-0.5 text-xs text-gray-500">
          <Bi v={step.detail} />
        </div>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <span className="text-gray-300 text-lg leading-none">↓</span>
    </div>
  );
}

function Legend({ actors }: { actors: Actor[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {actors.map((a) => (
        <ActorChip key={a} actor={a} />
      ))}
    </div>
  );
}

export function WorkflowDiagram({ wf }: { wf: Workflow }) {
  // Collect distinct actors for the legend.
  const actors = new Set<Actor>();
  wf.nodes.forEach((node) => {
    if ("type" in node && node.type === "split") {
      node.branches.forEach((b) => b.steps.forEach((s) => actors.add(s.actor)));
    } else {
      actors.add((node as FlowStep).actor);
    }
  });

  let stepNum = 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            <Bi v={wf.title} />
          </h3>
          {wf.subtitle ? (
            <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
              <Bi v={wf.subtitle} />
            </p>
          ) : null}
        </div>
        <Legend actors={[...actors]} />
      </div>

      <div>
        {wf.nodes.map((node, i) => {
          const isSplit = "type" in node && node.type === "split";
          return (
            <div key={i}>
              {i > 0 ? <Connector /> : null}
              {isSplit ? (
                <SplitBlock split={node as Extract<typeof node, { type: "split" }>} label={`${++stepNum}`} />
              ) : (
                <StepCard step={node as FlowStep} n={++stepNum} />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SplitBlock({
  split,
  label,
}: {
  split: { title: L; detail?: L; branches: { label: L; actor: Actor; steps: FlowStep[] }[] };
  label: string;
}) {
  return (
    <div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-white text-[11px] font-semibold">{label}</span>
          <span className="text-xs text-gray-400">⑂</span>
          <span className="text-sm font-medium text-gray-900">
            <BiBlock v={split.title} />
          </span>
        </div>
        {split.detail ? (
          <div className="mt-0.5 text-xs text-gray-500 pl-7">
            <Bi v={split.detail} />
          </div>
        ) : null}
      </div>
      <div className="flex justify-center py-1 text-gray-300 text-lg leading-none" aria-hidden>
        ↓
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {split.branches.map((b, bi) => (
          <div key={bi} className="rounded-lg border border-gray-200 bg-white p-2">
            <div className="mb-2 text-xs font-semibold text-gray-700">
              <Bi v={b.label} />
            </div>
            <div className="space-y-1.5">
              {b.steps.map((s, si) => (
                <div key={si}>
                  {si > 0 ? <div className="text-center text-gray-300 text-sm leading-none">↓</div> : null}
                  <StepCard step={s} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
