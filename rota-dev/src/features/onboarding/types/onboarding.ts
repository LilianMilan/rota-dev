export type FormValues = {
    goal: string;
    level: string;
    hoursPerDay: string;
    daysPerWeek: string;
    motivation: string;
  };
  
  export type PlanDay = {
    day: number;
    title: string;
    description: string;
    tasks: string[];
  };
  
  export type StudyPlan = {
    planTitle: string;
    days: PlanDay[];
  };