import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import type { CalculationInputs, CalculationResults, CompanyProfile, SavedProposal } from "@/types";

export type CalculationRecord = {
  id: string;
  date: string;
  inputs: CalculationInputs;
  results: CalculationResults;
  manufacturer: SavedProposal["selectedManufacturer"];
};
export type WorkspaceData = {
  calculations: CalculationRecord[];
  proposals: SavedProposal[];
  company: CompanyProfile | null;
};
export interface WorkspaceRepository {
  load(userId: string): Promise<WorkspaceData>;
  saveCalculation(userId: string, record: CalculationRecord): Promise<void>;
  saveProposal(userId: string, proposal: SavedProposal): Promise<void>;
  saveCompany(userId: string, company: CompanyProfile): Promise<void>;
  deleteProposal(userId: string, id: string): Promise<void>;
  clear(userId: string, kind: "calculations" | "proposals" | "all"): Promise<void>;
}
const json = (value: unknown): Json => JSON.parse(JSON.stringify(value)) as Json;
const check = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export function proposalFromRow(row: Tables<"proposals">): SavedProposal {
  return {
    id: row.id,
    calculationHistoryId: row.calculation_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as SavedProposal["status"],
    clientData: row.client_data as unknown as SavedProposal["clientData"],
    commercialData: row.commercial_data as unknown as SavedProposal["commercialData"],
    observations: row.observations,
    items: row.items as unknown as SavedProposal["items"],
    labor: row.labor as unknown as SavedProposal["labor"],
    costs: row.costs as unknown as SavedProposal["costs"],
    selectedManufacturer: (row.selected_manufacturer ||
      "WEG") as SavedProposal["selectedManufacturer"],
    companyProfile: row.company_snapshot as unknown as CompanyProfile,
    currentInputs: row.calculation_inputs as unknown as CalculationInputs,
    currentResults: row.calculation_results as unknown as CalculationResults,
    total: row.total,
  };
}
export function proposalToRow(userId: string, p: SavedProposal) {
  return {
    id: p.id,
    user_id: userId,
    calculation_id: p.calculationHistoryId,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    status: p.status,
    client_data: json(p.clientData),
    commercial_data: json(p.commercialData),
    observations: p.observations,
    items: json(p.items),
    labor: json(p.labor),
    costs: json(p.costs),
    selected_manufacturer: p.selectedManufacturer,
    company_snapshot: json(p.companyProfile),
    calculation_inputs: json(p.currentInputs),
    calculation_results: json(p.currentResults),
    total: p.total,
  };
}

export const workspaceRepository: WorkspaceRepository = {
  async load(userId) {
    // Page through the API's row limit instead of silently dropping old work.
    const calculations: Tables<"calculations">[] = [];
    const proposals: Tables<"proposals">[] = [];
    for (let start = 0; ; start += 500) {
      const r = await supabase
        .from("calculations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .order("id")
        .range(start, start + 499);
      check(r.error);
      calculations.push(...(r.data || []));
      if ((r.data?.length || 0) < 500) break;
    }
    for (let start = 0; ; start += 500) {
      const r = await supabase
        .from("proposals")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .order("id")
        .range(start, start + 499);
      check(r.error);
      proposals.push(...(r.data || []));
      if ((r.data?.length || 0) < 500) break;
    }
    const r = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    check(r.error);
    const c = r.data;
    return {
      calculations: calculations.map((row) => ({
        id: row.id,
        date: row.created_at,
        inputs: row.inputs as unknown as CalculationInputs,
        results: row.results as unknown as CalculationResults,
        manufacturer: (row.selected_manufacturer || "WEG") as SavedProposal["selectedManufacturer"],
      })),
      proposals: proposals.map(proposalFromRow),
      company: c
        ? {
            companyName: c.company_name || "",
            document: c.document || "",
            responsibleName: c.responsible_name || "",
            professionalRegistration: c.professional_registration || "",
            phone: c.phone || "",
            email: c.email || "",
            address: c.address || "",
            cityState: c.city_state || "",
            website: c.website || "",
            // Older profiles may contain a storage path. Inline logos are also kept in proposal snapshots.
            logoDataUrl: c.logo_path?.startsWith("data:image/") ? c.logo_path : "",
            brandColor: c.brand_color,
            logoBackground: c.logo_background as CompanyProfile["logoBackground"],
          }
        : null,
    };
  },
  async saveCalculation(userId, r) {
    const result = await supabase
      .from("calculations")
      .upsert(
        {
          id: r.id,
          user_id: userId,
          inputs: json(r.inputs),
          results: json(r.results),
          selected_manufacturer: r.manufacturer,
          created_at: r.date,
          updated_at: r.date,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();
    check(result.error);
  },
  async saveProposal(userId, proposal) {
    const r = await supabase
      .from("proposals")
      .upsert(proposalToRow(userId, proposal), { onConflict: "id" })
      .select("id")
      .single();
    check(r.error);
  },
  async saveCompany(userId, c) {
    const r = await supabase
      .from("company_profiles")
      .upsert(
        {
          user_id: userId,
          company_name: c.companyName,
          document: c.document,
          responsible_name: c.responsibleName,
          professional_registration: c.professionalRegistration,
          phone: c.phone,
          email: c.email,
          address: c.address,
          city_state: c.cityState,
          website: c.website,
          logo_path: c.logoDataUrl || null,
          brand_color: c.brandColor,
          logo_background: c.logoBackground,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("user_id")
      .single();
    check(r.error);
  },
  async deleteProposal(userId, id) {
    const r = await supabase.from("proposals").delete().eq("user_id", userId).eq("id", id);
    check(r.error);
  },
  async clear(userId, kind) {
    if (kind !== "calculations") {
      const r = await supabase.from("proposals").delete().eq("user_id", userId);
      check(r.error);
    }
    if (kind !== "proposals") {
      const r = await supabase.from("calculations").delete().eq("user_id", userId);
      check(r.error);
    }
    if (kind === "all") {
      const r = await supabase.from("clients").delete().eq("user_id", userId);
      check(r.error);
    }
  },
};
