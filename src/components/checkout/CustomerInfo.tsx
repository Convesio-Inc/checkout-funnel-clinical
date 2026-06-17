/**
 * CustomerInfo
 * -----------------------------------------------------------------------------
 * Collects email + phone and an SMS-updates opt-in. Fully controlled; the
 * parent owns state. Email is required so the browser blocks submission.
 *
 * Markers: email field data-field="email"; phone field data-field="phone-number".
 * -----------------------------------------------------------------------------
 */

import { Icon } from "@/components/icons";
import { Field, inputCls } from "@/components/checkout/form-atoms";

export interface CustomerInfoValue {
  email: string;
  phoneNumber: string;
}

export interface CustomerInfoCardProps {
  value: CustomerInfoValue;
  onChange: (next: CustomerInfoValue) => void;
}

export function CustomerInfo({ value, onChange }: CustomerInfoCardProps) {
  const set =
    (key: keyof CustomerInfoValue) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: event.target.value });

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" icon={<Icon.Mail className="w-4 h-4" />} dataField="email">
          <input
            className={inputCls}
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            required
            value={value.email}
            onChange={set("email")}
          />
        </Field>
        <Field label="Phone" optional dataField="phone-number">
          <input
            className={inputCls}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(555) 010-4423"
            value={value.phoneNumber}
            onChange={set("phoneNumber")}
          />
        </Field>
      </div>
      <label className="mt-3 flex items-center gap-2 text-[12px] text-ink2 select-none">
        <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-ink" />
        Send shipping updates by SMS.
      </label>
    </>
  );
}
