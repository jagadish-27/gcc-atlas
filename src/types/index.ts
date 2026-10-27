// Core data model for GCC Atlas.
// Every sourced claim must be traceable to its source.

export type VerificationStatus =
  | 'verified'
  | 'reported'
  | 'estimated'
  | 'needs_verification';

export type OperatingStatus = 'active' | 'inactive' | 'unknown';

export type GccFunction =
  | 'Engineering & R&D'
  | 'IT & Infrastructure'
  | 'Data & Analytics'
  | 'Finance & Accounting'
  | 'HR & Talent'
  | 'Customer Support'
  | 'Product & Design'
  | 'Procurement & Supply Chain'
  | 'Legal & Compliance'
  | 'Marketing & Growth'
  | 'Sales Operations';

export type SignalCategory =
  | 'New GCC establishment'
  | 'Expansion'
  | 'Investment announcement'
  | 'Office lease or relocation'
  | 'Hiring activity'
  | 'Government policy or incentive';

export interface DataSource {
  id: string;
  name: string;
  publisher: string;
  url: string;
  publishedDate: string; // ISO date the source was published
  accessedDate: string; // ISO date the source was last accessed/checked
  type: 'news' | 'company-announcement' | 'government' | 'industry-report' | 'press-release' | 'other';
}

export interface Company {
  id: string;
  name: string;
  parentCompany?: string;
  industry: string;
  city: string;
  functions: GccFunction[];
  establishmentYear?: number;
  operatingStatus: OperatingStatus;
  description: string;
  verificationStatus: VerificationStatus;
  sourceId: string;
  lastVerifiedDate: string; // ISO date record was last checked
}

export interface CityMetricValue {
  id: string;
  cityId: string;
  metricKey: CityMetricKey;
  value: string;
  unit: string;
  sourceId: string;
  referencePeriod: string; // e.g. "Q1 2024", "FY 2023"
  confidence: VerificationStatus;
  notes?: string;
}

export type CityMetricKey =
  | 'gcc_count'
  | 'office_rent_grade_a'
  | 'office_rent_seap'
  | 'seap_vacancy'
  | 'tech_talent_pool'
  | 'engineering_graduates_annual'
  | 'avg_salary_mid_engineer'
  | 'incentive_it_policy'
  | 'incentive_capex_subsidy'
  | 'incentive_rnd_rebate'
  | 'airport_connectivity'
  | 'metro_rail_status'
  | 'cost_of_living_index'
  | 'office_stock_grade_a';

export interface CityMetricDefinition {
  key: CityMetricKey;
  label: string;
  category: 'gcc-presence' | 'real-estate' | 'talent' | 'incentives' | 'infrastructure' | 'cost';
  unitLabel: string;
  comparable: boolean; // can be compared across cities with the same definition
  description: string;
}

export interface City {
  id: string;
  name: string;
  region: string;
  summary: string;
  industryClusters: string[];
  incentivesSummary: string;
  incentiveSourceId: string;
  incentiveReferencePeriod: string;
  incentiveConfidence: VerificationStatus;
}

export interface MarketSignal {
  id: string;
  headline: string;
  companyId?: string;
  company: string; // display name (may not be in company dataset)
  city: string;
  category: SignalCategory;
  publicationDate: string; // ISO date
  eventDate?: string; // ISO date if known
  summary: string;
  sourceId: string;
  sourceUrl?: string;
  verificationStatus: VerificationStatus;
}
