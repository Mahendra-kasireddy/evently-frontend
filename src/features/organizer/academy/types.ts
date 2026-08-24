export interface AcademyLesson {
  key: string;
  title: string;
  minutes: number;
  completed: boolean;
}

export interface AcademyWorkshop {
  key: string;
  title: string;
  when: string;
  registered: boolean;
}

export interface AcademyStage3Item {
  key: string;
  title: string;
  completed: boolean;
}

export interface AcademyStatus {
  trainingStage: number;
  overallPercent: number;
  stage1: { completedCount: number; totalCount: number; lessons: AcademyLesson[] };
  stage2: { unlocked: boolean; workshops: AcademyWorkshop[] };
  stage3: { unlocked: boolean; items: AcademyStage3Item[] };
}
