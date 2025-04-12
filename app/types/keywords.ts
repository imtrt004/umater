export type KeywordCategory = 
  | 'General' 
  | 'Software & Apps' 
  | 'Educational' 
  | 'Comparison' 
  | 'Shopping';

export type KeywordIntent = 
  | 'Informational' 
  | 'Commercial' 
  | 'Transactional' 
  | 'Navigational';

export interface KeywordMetrics {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  category: KeywordCategory;
  intent: KeywordIntent;
  difficulty: number;
  competitionScore?: number;
  monthlyClicks?: number;
  opportunityScore?: number;
  growthTrend?: number;
  wordCount?: number;
}

export interface KeywordAnalyticsProps {
  metrics: KeywordMetrics[];
  isLoading?: boolean;
  onKeywordSelect?: (keyword: string) => void;
}

export interface KeywordResultsProps {
  suggestions: string[];
  onAnalyze: (keywords: string[]) => void;
  selectedKeywords: string[];
  onToggleKeyword: (keyword: string) => void;
  isLoading?: boolean;
  onKeywordSelect?: (keyword: string) => void;
  keywordMetrics?: KeywordMetrics[];
}

export interface KeywordAnalysisResult {
  keyword: string;
  suggestions: string[];
  metrics: KeywordMetrics[];
  analysisDate: string;
} 