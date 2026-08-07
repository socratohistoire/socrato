import { leaveStudentSpace } from "./actions";

export function StudentLogoutButton() {
  return (
    <form action={leaveStudentSpace} className="student-logout-form">
      <button type="submit" className="student-logout-button">
        <span aria-hidden="true">↪</span>
        <span>Se déconnecter</span>
      </button>
    </form>
  );
}
