/**
 * ShippingInfo
 * -----------------------------------------------------------------------------
 * U.S. shipping address, AG1 layout:
 *   [First name] [Family name]
 *   [Street (icon)            ]
 *   [Apt / suite] [City] [State] [ZIP]
 * Fully controlled; country fixed to the U.S.
 *
 * Markers: data-field="first-name" | "last-name" | "street" | "apt-suite" |
 *          "city" | "state" | "zip".
 * -----------------------------------------------------------------------------
 */

import { Icon } from "@/components/icons";
import { Field, inputCls } from "@/components/checkout/form-atoms";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export interface ShippingInfoValue {
  firstName: string;
  lastName: string;
  street: string;
  aptSuite: string;
  city: string;
  stateOrProvince: string;
  zip: string;
  country: string;
}

export interface ShippingInfoProps {
  value: ShippingInfoValue;
  onChange: (next: ShippingInfoValue) => void;
}

export function ShippingInfo({ value, onChange }: ShippingInfoProps) {
  const set =
    (key: keyof ShippingInfoValue) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="First name" span="col-span-1" dataField="first-name">
        <input className={inputCls} type="text" autoComplete="given-name" placeholder="Alex" required value={value.firstName} onChange={set("firstName")} />
      </Field>
      <Field label="Family name" span="col-span-1" dataField="last-name">
        <input className={inputCls} type="text" autoComplete="family-name" placeholder="Mendez" required value={value.lastName} onChange={set("lastName")} />
      </Field>
      <Field label="Street" icon={<Icon.Pin className="w-4 h-4" />} dataField="street">
        <input className={inputCls} type="text" autoComplete="address-line1" placeholder="2114 Larkspur Lane" required value={value.street} onChange={set("street")} />
      </Field>
      <Field label="Apt / suite" span="col-span-1" optional dataField="apt-suite">
        <input className={inputCls} type="text" autoComplete="address-line2" placeholder="—" value={value.aptSuite} onChange={set("aptSuite")} />
      </Field>
      <Field label="City" span="col-span-1" dataField="city">
        <input className={inputCls} type="text" autoComplete="address-level2" placeholder="Portland" required value={value.city} onChange={set("city")} />
      </Field>
      <Field label="State" span="col-span-1" dataField="state">
        <select className={inputCls} autoComplete="address-level1" required value={value.stateOrProvince} onChange={set("stateOrProvince")}>
          <option value="" disabled>State</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="ZIP" span="col-span-1" dataField="zip">
        <input className={inputCls} type="text" inputMode="numeric" autoComplete="postal-code" placeholder="97214" required value={value.zip} onChange={set("zip")} />
      </Field>
    </div>
  );
}
