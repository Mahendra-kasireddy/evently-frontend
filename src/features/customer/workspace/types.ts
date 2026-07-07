export type CatStatus = 'On track' | 'In progress' | 'Action needed';
export interface WsCategory { id: string; name: string; status: CatStatus; subVendor: string; desc: string }
export interface WsMember { initials: string; color: string }
export interface WsTimelineItem { time: string; label: string; done: boolean }
export interface WorkspaceData {
  progress: number;
  eyebrow: string;
  heading: string;
  subline: string;
  countdown: { days: string; hrs: string; min: string };
  ideas: { title: string; meta: string; cta: string };
  invitation: { title: string; meta: string; cta: string };
  categories: WsCategory[];
  organizer: { initials: string; name: string; note: string; color: string };
  familyTitle: string;
  family: WsMember[];
  timelineTitle: string;
  timeline: WsTimelineItem[];
}
