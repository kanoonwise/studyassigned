import { createClient } from "@/lib/supabase/server";
import { ImportUploader } from "./ImportUploader";
import { BatchHistory } from "./BatchHistory";

export default async function AdminImportsPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase
    .from("import_batches")
    .select("id, filename, uploaded_at, state")
    .order("uploaded_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-semibold">Imports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The workbook is parsed entirely in your browser - nothing is uploaded until you approve.
        </p>
        <div className="mt-6">
          <ImportUploader />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Batch history</h2>
        <div className="mt-4 overflow-x-auto">
          <BatchHistory batches={batches ?? []} />
        </div>
      </div>
    </div>
  );
}
