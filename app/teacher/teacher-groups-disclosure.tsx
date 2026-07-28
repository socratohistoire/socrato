"use client";

import { useId, useState } from "react";
import type { TeacherGroupOverview } from "@/lib/teacher-dashboard";
import { ScrollRegion } from "./scroll-region";

export function TeacherGroupsDisclosure({ groups }: { groups: readonly Pick<TeacherGroupOverview, "id" | "name" | "studentCount">[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  return <div className="teacher-groups-menu" data-long-list={groups.length >= 8 || undefined}>
    <button type="button" className="sidebar-nav-tile groups-disclosure" aria-expanded={isOpen} aria-controls={menuId} onClick={() => setIsOpen((open) => !open)}>
      <span className="sidebar-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><circle cx="12" cy="6" r="2.5" /><path d="M3.5 19c.3-3.4 1.9-5.2 4.5-5.2M20.5 19c-.3-3.4-1.9-5.2-4.5-5.2M6.5 19c.4-4.1 2.2-6.2 5.5-6.2s5.1 2.1 5.5 6.2" /></svg></span>
      <span>Groupes</span><svg className="disclosure-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg>
    </button>
    {isOpen && <div id={menuId} className="teacher-groups-submenu">
      <ScrollRegion className="sidebar-groups-scroll" label="Liste des groupes de l’enseignante" hint="Faire défiler pour voir les autres groupes">
        <ul className="sidebar-groups-list">
          {groups.map((group) => <li key={group.id} tabIndex={0} aria-label={`${group.name}, ${group.studentCount} élèves. Détails du groupe — Fonction à venir`}>
            <span className="sidebar-group-dot" aria-hidden="true">{group.name.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span>
            <span><strong>{group.name}</strong><small>{group.studentCount} élèves</small></span>
          </li>)}
        </ul>
      </ScrollRegion>
    </div>}
  </div>;
}
