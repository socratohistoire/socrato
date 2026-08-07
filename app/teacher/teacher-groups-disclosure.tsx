"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { TeacherGroupOverview } from "@/lib/teacher-dashboard";
import { ScrollRegion } from "./scroll-region";

type SidebarGroup = Pick<TeacherGroupOverview, "id" | "name" | "studentCount"> & { detailsHref?: string };
const GROUPS_MENU_STORAGE_KEY = "socrato:teacher-groups-menu-open";

export function TeacherGroupsDisclosure({ groups }: { groups: readonly SidebarGroup[] }) {
  const [isOpen, setIsOpen] = useState(() => typeof window !== "undefined" && window.sessionStorage.getItem(GROUPS_MENU_STORAGE_KEY) === "1");
  const menuId = useId();

  function toggleMenu() {
    setIsOpen((open) => { const next = !open; window.sessionStorage.setItem(GROUPS_MENU_STORAGE_KEY, next ? "1" : "0"); return next; });
  }

  return <div className="teacher-groups-menu" data-long-list={groups.length >= 8 || undefined}>
    <button type="button" className="sidebar-nav-tile groups-disclosure" aria-expanded={isOpen} aria-controls={menuId} onClick={toggleMenu}>
      <span className="sidebar-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><circle cx="12" cy="6" r="2.5" /><path d="M3.5 19c.3-3.4 1.9-5.2 4.5-5.2M20.5 19c-.3-3.4-1.9-5.2-4.5-5.2M6.5 19c.4-4.1 2.2-6.2 5.5-6.2s5.1 2.1 5.5 6.2" /></svg></span>
      <span>Groupes</span><svg className="disclosure-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg>
    </button>
    {isOpen && <div id={menuId} className="teacher-groups-submenu">
      <ScrollRegion className="sidebar-groups-scroll" label="Liste des groupes de l’enseignante" hint="Faire défiler pour voir les autres groupes">
        <ul className="sidebar-groups-list">
          {groups.map((group) => <li key={group.id}>
            {group.detailsHref ? <Link className="sidebar-group-entry" href={group.detailsHref} aria-label={`${group.name}, ${group.studentCount} élèves. Ouvrir le groupe`}>
              <span className="sidebar-group-dot" aria-hidden="true">{group.name.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span><span><strong>{group.name}</strong><small>{group.studentCount} élèves</small></span>
            </Link> : <div className="sidebar-group-entry" tabIndex={0} aria-label={`${group.name}, ${group.studentCount} élèves. Détails du groupe — Fonction à venir`}>
              <span className="sidebar-group-dot" aria-hidden="true">{group.name.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span><span><strong>{group.name}</strong><small>{group.studentCount} élèves</small></span>
            </div>}
          </li>)}
        </ul>
      </ScrollRegion>
    </div>}
  </div>;
}
