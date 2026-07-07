import { z } from 'zod';

export type StepStatus = 'completed' | 'current' | 'pending';
export interface OnboardingStep {
  id: string;
  order: number;
  title: string;
  status: StepStatus;
}

export const basicInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  city: z.string().min(1, 'Select a city'),
  category: z.string().min(1, 'Select a category'),
});
export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
export type BasicInfoFieldErrors = Partial<Record<keyof BasicInfoValues, string>>;
