"use client";

import { useId, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TeacherGroupOverview } from "@/lib/teacher-dashboard";
import { ScrollRegion } from "./scroll-region";
import { renameTeacherGroup } from "./groups/group-actions";

type SidebarGroup = Pick<TeacherGroupOverview, "id" | "name" | "studentCount"> & { detailsHref?: string };
const GROUPS_MENU_STORAGE_KEY = "socrato:teacher-groups-menu-open";
const GROUPS_MENU_CHANGE_EVENT = "socrato:teacher-groups-menu-change";

function subscribeToGroupsMenu(callback: () => void) {
  window.addEventListener(GROUPS_MENU_CHANGE_EVENT, callback);
  return () => window.removeEventListener(GROUPS_MENU_CHANGE_EVENT, callback);
}

function getGroupsMenuSnapshot() {
  return window.sessionStorage.getItem(GROUPS_MENU_STORAGE_KEY) === "1";
}

export function TeacherGroupsDisclosure({ groups }: { groups: readonly SidebarGroup[] }) {
  const isOpen = useSyncExternalStore(subscribeToGroupsMenu, getGroupsMenuSnapshot, () => false);
  const menuId = useId();
  const router = useRouter();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [renameError, setRenameError] = useState("");
  const [renamePending, startRenameTransition] = useTransition();

  function toggleMenu() {
    window.sessionStorage.setItem(GROUPS_MENU_STORAGE_KEY, isOpen ? "0" : "1");
    window.dispatchEvent(new Event(GROUPS_MENU_CHANGE_EVENT));
  }

  function openGroup(href: string) {
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    navigationTimer.current = setTimeout(() => router.push(href), 240);
  }

  function beginRename(group: SidebarGroup) {
    if (!group.detailsHref) return;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    setDraftName(groupNames[group.id] ?? group.name);
    setRenameError("");
    setEditingGroupId(group.id);
  }

  function saveRename(group: SidebarGroup) {
    if (renamePending || editingGroupId !== group.id) return;
    startRenameTransition(() => {
      void renameTeacherGroup(group.id, draftName).then((result) => {
        if (!result.ok) return setRenameError(result.error);
        setGroupNames((current) => ({ ...current, [group.id]: result.name }));
        setEditingGroupId(null);
        setRenameError("");
        router.refresh();
      });
    });
  }

  return <div className="teacher-groups-menu" data-long-list={groups.length >= 8 || undefined}>
    <button type="button" className="sidebar-nav-tile groups-disclosure" aria-expanded={isOpen} aria-controls={menuId} onClick={toggleMenu}>
      <span className="sidebar-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><circle cx="12" cy="6" r="2.5" /><path d="M3.5 19c.3-3.4 1.9-5.2 4.5-5.2M20.5 19c-.3-3.4-1.9-5.2-4.5-5.2M6.5 19c.4-4.1 2.2-6.2 5.5-6.2s5.1 2.1 5.5 6.2" /></svg></span>
      <span>Groupes</span><svg className="disclosure-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" /></svg>
    </button>
    {isOpen && <div id={menuId} className="teacher-groups-submenu">
      <ScrollRegion className="sidebar-groups-scroll" label="Liste des groupes de l’enseignante" hint="Faire défiler pour voir les autres groupes">
        <ul className="sidebar-groups-list">
          {groups.map((group) => { const displayedName = groupNames[group.id] ?? group.name; return <li key={group.id}>
            {editingGroupId === group.id ? <div className="sidebar-group-entry sidebar-group-entry-editing"><span className="sidebar-group-dot" aria-hidden="true">{displayedName.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span><span><input value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveRename(group); } if (event.key === "Escape") { setEditingGroupId(null); setRenameError(""); } }} maxLength={80} autoFocus aria-label="Nouveau nom du groupe" disabled={renamePending} /><small>{renameError || "Entrée pour enregistrer · Échap pour annuler"}</small></span></div> : group.detailsHref ? <button type="button" className="sidebar-group-entry sidebar-group-entry-button" onClick={() => openGroup(group.detailsHref!)} onDoubleClick={() => beginRename(group)} aria-label={`${displayedName}, ${group.studentCount} élèves. Ouvrir le groupe`} title="Double-cliquez pour renommer">
              <span className="sidebar-group-dot" aria-hidden="true">{displayedName.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span><span><strong>{displayedName}</strong><small>{group.studentCount} élèves</small></span>
            </button> : <div className="sidebar-group-entry" tabIndex={0} aria-label={`${displayedName}, ${group.studentCount} élèves. Détails du groupe — Fonction à venir`}>
              <span className="sidebar-group-dot" aria-hidden="true">{displayedName.match(/\d+/)?.[0]?.slice(-1) ?? "G"}</span><span><strong>{displayedName}</strong><small>{group.studentCount} élèves</small></span>
            </div>}
          </li>; })}
        </ul>
      </ScrollRegion>
    </div>}
  </div>;
}
