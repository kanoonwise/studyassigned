export interface DisclosureInput {
  toolsUsed: string[];
  purpose: string;
  sections: string[];
  fromDate: Date;
  toDate: Date;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** AI-Use Disclosure Generator - a ready statement, not a legal opinion. */
export function generateDisclosureStatement(input: DisclosureInput): string {
  const tools = input.toolsUsed.length > 0 ? input.toolsUsed.join(", ") : "[list the tools used]";
  const sections =
    input.sections.length > 0 ? input.sections.join(", ") : "[list the affected sections]";

  return [
    `AI-Use Disclosure`,
    ``,
    `Between ${dateFormatter.format(input.fromDate)} and ${dateFormatter.format(input.toDate)}, ` +
      `I used the following AI tool(s): ${tools}.`,
    ``,
    `Purpose: ${input.purpose || "[describe why the tool was used]"}`,
    ``,
    `Section(s) affected: ${sections}`,
    ``,
    `All analysis, arguments and conclusions in this work are my own. AI tool output was used only ` +
      `as described above and was reviewed and, where used, rewritten by me.`,
    ``,
    `Please check your institution's own AI-use policy - requirements for what must be disclosed, and how, vary.`,
  ].join("\n");
}
