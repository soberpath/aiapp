import { supabase } from '../config/supabase';
import type { ServicePackage, PackageTier, Phase } from '../types';

// ─── Public (no auth required) ───────────────────────────────────────────────

/**
 * Fetch all active service packages for display on the public store.
 * Anyone can call this — no auth needed.
 */
export async function getActivePackages(): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPackage);
}

// ─── Consultant-only mutations ────────────────────────────────────────────────

/**
 * Fetch ALL packages (active + inactive) — consultant dashboard use only.
 */
export async function getAllPackages(): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPackage);
}

export interface CreatePackageInput {
  name: string;
  tier: PackageTier;
  description: string;
  features: string[];
  priceUsd: number | null;
  pricingLabel?: string;
  phases: Phase[];
  isActive?: boolean;
  sortOrder?: number;
}

export async function createPackage(input: CreatePackageInput): Promise<ServicePackage> {
  const { data, error } = await supabase
    .from('service_packages')
    .insert({
      id: crypto.randomUUID(),
      name: input.name,
      tier: input.tier,
      description: input.description,
      features: input.features,
      price_usd: input.priceUsd,
      pricing_label: input.pricingLabel ?? null,
      phases: input.phases,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create package');
  return rowToPackage(data);
}

export async function updatePackage(
  id: string,
  updates: Partial<CreatePackageInput>,
): Promise<void> {
  const { error } = await supabase
    .from('service_packages')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.tier !== undefined && { tier: updates.tier }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.features !== undefined && { features: updates.features }),
      ...(updates.priceUsd !== undefined && { price_usd: updates.priceUsd }),
      ...(updates.pricingLabel !== undefined && { pricing_label: updates.pricingLabel }),
      ...(updates.phases !== undefined && { phases: updates.phases }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      ...(updates.sortOrder !== undefined && { sort_order: updates.sortOrder }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function togglePackageActive(id: string, isActive: boolean): Promise<void> {
  await updatePackage(id, { isActive });
}

export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase
    .from('service_packages')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToPackage(row: Record<string, unknown>): ServicePackage {
  return {
    id: row.id as string,
    name: row.name as string,
    tier: row.tier as PackageTier,
    description: row.description as string,
    features: row.features as string[],
    priceUsd: row.price_usd as number | null,
    pricingLabel: (row.pricing_label as string) ?? undefined,
    phases: row.phases as Phase[],
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  };
}
