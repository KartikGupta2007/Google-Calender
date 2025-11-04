export interface SearchResult {
  id: string;
  title: string;
  startDate: Date;
  calendar: {
    id: string;
    name: string;
    color: string;
  };
}