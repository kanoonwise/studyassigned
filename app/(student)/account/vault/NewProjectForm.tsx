"use client";

import { useRef } from "react";
import { createVaultProject } from "./actions";

export function NewProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    const result = await createVaultProject(formData);
    if (!result.error) formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex gap-2 text-sm">
      <input
        type="text"
        name="title"
        placeholder="Project title, e.g. MSc Thesis"
        required
        className="flex-1 rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      />
      <button type="submit" className="bg-primary text-primary-foreground rounded-full px-4 py-2">
        Start a project
      </button>
    </form>
  );
}
