"use client";

import { useState } from "react";
import { toggleChecklistItem } from "./actions";

interface Item {
  id: string;
  month: string;
  item: string;
  done: boolean;
}

export function ChecklistRow({ item }: { item: Item }) {
  const [done, setDone] = useState(item.done);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    const result = await toggleChecklistItem(item.id, !done);
    setBusy(false);
    if (!result.error) setDone(!done);
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={done} onChange={handleToggle} disabled={busy} />
      <span className="text-zinc-500">{item.month}</span>
      <span className={done ? "text-zinc-400 line-through" : ""}>{item.item}</span>
    </li>
  );
}
