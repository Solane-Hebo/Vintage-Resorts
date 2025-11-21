import type { ComponentProps, ReactNode } from "react";
import {
  Wifi,
  ParkingCircle,
  PawPrint,
  Coffee,
  WashingMachine,
  Tv,
  DoorOpen,
  Trees,
  Snowflake,
  Thermometer,
  Utensils,
} from "lucide-react";

type OfferItem = {
  label: string;
  icon: (props: ComponentProps<"svg">) =>  ReactNode
};

export const DEFAULT_OFFERS: OfferItem[] = [
  { label: "Free Wi-Fi",        icon: Wifi },
  { label: "Free parking",      icon: ParkingCircle },
  { label: "Pets allowed",      icon: PawPrint },
  { label: "Coffee maker",      icon: Coffee },
  { label: "Washer",            icon: WashingMachine },
  { label: "TV",                icon: Tv },
  { label: "Balcony",           icon: DoorOpen },
  { label: "Garden view",       icon: Trees },
  { label: "Air conditioning",  icon: Snowflake },
  { label: "Heating",           icon: Thermometer },
  { label: "Full kitchen",      icon: Utensils },
];

type Props = {
  title?: string;
  items?: OfferItem[];
  className?: string;
  columnsClass?: string; 
};

export function WhatThisPlaceOffers({
  title = "What this place offers",
  items = DEFAULT_OFFERS,
  className = "",
  columnsClass = "grid sm:grid-cols-2 gap-2 lg:grid-cols-3",
}: Props) {
  return (
    <section className={className}>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <ul className={`text-white/80 ${columnsClass}`}>
        {items.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2 py-1">
            <Icon className="w-4 h-4 opacity-80 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
