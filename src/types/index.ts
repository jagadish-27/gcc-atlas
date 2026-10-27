// Core data model for GCC Atlas.
// Every sourced claim must be traceable to its source.

export type VerificationStatus =
  | 'verified'
  | 'source_reported'
  | 'reported'
  | 'estimated'
  | 'needs_verification'
  | 'conflicting_evidence';

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
  | 'Leadership appointment'
  | 'New service-provider offering'
  | 'Government policy or incentive';

export type IncentiveType =
  | 'Capital expenditure support'
  | 'Employment or payroll-linked incentive'
  | 'Lease or rental support'
  | 'Stamp duty concession'
  | 'Electricity-related benefit'
  | 'Research and innovation support'
  | 'Other business incentive';

export type IncentivePolicyStatus =
  | 'active'
  | 'historical'
  | 'announced_unconfirmed'
  | 'eligibility_unclear'
  | 'needs_verification';

export type ProviderCategory =
  | 'GCC setup and strategy consulting'
  | 'Legal and regulatory advisory'
  | 'Tax, accounting, and audit'
  | 'Recruitment and talent acquisition'
  | 'Payroll and Employer of Record (EOR)'
  | 'Commercial real estate and office leasing'
  | 'Technology and IT services'
  | 'Corporate administration and compliance';

export interface DataSource {
  id: string;
  name: string;
  publisher: string;
  url: string;
  publishedDate: string; // ISO date the source was published
  accessedDate: string; // ISO date the source was last accessed/checked
  type: 'news' | 'company-announcement' | 'government' | 'industry-report' | 'press-release' | 'provider-website' | 'other';
  supportedClaims?: string[];
  verificationNotes?: string;
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
  notes?: string; // missing or uncertain information
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
  limitations?: string;
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

export interface ServiceProvider {
  id: string;
  name: string;
  categories: ProviderCategory[];
  services: string[];
  locations: string[]; // Indian cities or markets served
  gccServices: string; // GCC-specific services description
  documentedCases?: string; // publicly documented client examples or case studies
  sourceId: string;
  verificationStatus: VerificationStatus;
  lastCheckedDate: string;
  notes?: string; // track record disclosures, limitations
}

export interface IncentiveRecord {
  id: string;
  state: string;
  policyName: string;
  issuingAuthority: string;
  incentiveType: IncentiveType;
  benefitDetails: string;
  eligibility: string;
  effectivePeriod: string;
  expiryDate?: string;
  officialUrl: string;
  sourceId: string;
  policyStatus: IncentivePolicyStatus;
  lastCheckedDate: string;
  notes?: string;
}
