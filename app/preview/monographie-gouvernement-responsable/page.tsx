import { notFound } from "next/navigation";
import { RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD } from "@/lib/pedagogical-reference";
import { ReferenceValidationView } from "@/app/admin/pedagogical-reference/reference-validation-view";
import "@/app/admin/pedagogical-reference/pedagogical-reference.css";

export default function ResponsibleGovernmentMonographPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ReferenceValidationView record={RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD} initialSection="lecture" />;
}
