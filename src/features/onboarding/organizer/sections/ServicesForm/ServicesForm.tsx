import { MapPin } from 'lucide-react';
import { ChipSelect, SelectField, TextField, Toggle } from '../Fields';
import type { UseOnboardingResult } from '../../hooks/useOnboarding';
import form from '../StepForm.module.css';

/** Step 4 — Services. All dropdowns come from MongoDB (services-config). */
export function ServicesForm({ onb }: { onb: UseOnboardingResult }) {
  const { values, servicesConfig: c, servicesConfigLoading: loading, fieldErrors } = onb;
  const err = (k: keyof typeof fieldErrors) => (fieldErrors[k] ? { error: fieldErrors[k] } : {});

  return (
    <div className={form.form}>
      <div className={form.grid2}>
        <SelectField
          label="Experience"
          required
          value={values.experience}
          onChange={(v) => onb.setField('experience', v)}
          options={c?.experienceRanges ?? []}
          disabled={loading}
        />
        <SelectField
          label="Team size"
          required
          value={values.teamSize}
          onChange={(v) => onb.setField('teamSize', v)}
          options={c?.teamSizes ?? []}
          disabled={loading}
        />
      </div>

      <ChipSelect
        label="Languages spoken"
        required
        options={c?.languages ?? []}
        selected={values.languages}
        onToggle={(k) => onb.toggleArray('languages', k)}
        disabled={loading}
      />

      <ChipSelect
        label="Secondary categories"
        options={c?.categories ?? []}
        selected={values.secondaryCategories}
        onToggle={(k) => onb.toggleArray('secondaryCategories', k)}
        disabled={loading}
      />

      <ChipSelect
        label="Services offered"
        options={c?.serviceCategories ?? []}
        selected={values.servicesOffered}
        onToggle={(k) => onb.toggleArray('servicesOffered', k)}
        disabled={loading}
      />

      <ChipSelect
        label="Occasions covered"
        required
        options={c?.occasions ?? []}
        selected={values.occasions}
        onToggle={(k) => onb.toggleArray('occasions', k)}
        disabled={loading}
      />

      <div className={form.grid2}>
        <SelectField
          label="Travel availability"
          required
          value={values.travelOption}
          onChange={(v) => onb.setField('travelOption', v)}
          options={c?.travelOptions ?? []}
          disabled={loading}
        />
        <TextField
          label="Service radius (km)"
          type="number"
          icon={<MapPin size={16} />}
          value={values.serviceRadius}
          onChange={(v) => onb.setField('serviceRadius', v)}
        />
      </div>

      <ChipSelect
        label="Working days"
        required
        options={c?.workingDays ?? []}
        selected={values.workingDays}
        onToggle={(k) => onb.toggleArray('workingDays', k)}
        disabled={loading}
      />

      <div className={form.grid2}>
        <TextField
          label="Working hours — start"
          type="time"
          value={values.workingHoursStart}
          onChange={(v) => onb.setField('workingHoursStart', v)}
          {...err('workingHoursStart')}
        />
        <TextField
          label="Working hours — end"
          type="time"
          value={values.workingHoursEnd}
          onChange={(v) => onb.setField('workingHoursEnd', v)}
          {...err('workingHoursEnd')}
        />
      </div>

      <ChipSelect
        label="Payment methods accepted"
        options={c?.paymentMethods ?? []}
        selected={values.paymentMethods}
        onToggle={(k) => onb.toggleArray('paymentMethods', k)}
        disabled={loading}
      />

      <div className={form.grid3}>
        <TextField
          label="Minimum budget"
          type="number"
          required
          prefix="₹"
          value={values.minBudget}
          onChange={(v) => onb.setField('minBudget', v)}
        />
        <TextField
          label="Maximum budget"
          type="number"
          required
          prefix="₹"
          value={values.maxBudget}
          onChange={(v) => onb.setField('maxBudget', v)}
        />
        <TextField
          label="Advance payment"
          type="number"
          suffix="%"
          value={values.advancePercentage}
          onChange={(v) => onb.setField('advancePercentage', v)}
        />
      </div>

      <div className={form.grid3}>
        <Toggle
          label="Available for emergencies"
          checked={values.emergencyAvailability}
          onChange={(v) => onb.setField('emergencyAvailability', v)}
        />
        <Toggle
          label="Destination events"
          checked={values.destinationEvents}
          onChange={(v) => onb.setField('destinationEvents', v)}
        />
        <Toggle
          label="International events"
          checked={values.internationalEvents}
          onChange={(v) => onb.setField('internationalEvents', v)}
        />
      </div>
    </div>
  );
}
