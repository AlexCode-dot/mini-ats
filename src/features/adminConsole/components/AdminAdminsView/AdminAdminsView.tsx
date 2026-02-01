"use client";
import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CreateAdminModal from "@/features/adminConsole/components/CreateAdminModal/CreateAdminModal";
import { useAdminAdminsView } from "@/features/adminConsole/hooks/useAdminAdminsView";
import styles from "@/features/adminConsole/components/AdminAdminsView/AdminAdminsView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import TableCard from "@/shared/components/TableCard/TableCard";
import { formatDate } from "@/shared/utils/formatDate";

export default function AdminAdminsView() {
  const { state, filters, data, modals, actions } = useAdminAdminsView();

  return (
    <AdminShell title="Admin Users">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <SearchInput
            value={filters.query}
            onChange={(event) => filters.setQuery(event.target.value)}
            placeholder="Search admin..."
          />
          <Button
            type="button"
            startIcon="+"
            onClick={modals.adminModals.openCreateAdmin}
          >
            Create Admin
          </Button>
        </div>
        <TableCard>
          <div className={styles.mobileList}>
            <InlineError message={state.error} />
          </div>
          {state.isLoading ? (
            <div className={styles.mobileList}>Loading...</div>
          ) : null}
          {!state.isLoading && !state.error ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.filtered.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.name ?? "—"}</td>
                      <td>{admin.email ?? "—"}</td>
                      <td>{formatDate(admin.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.mobileList}>
                {data.filtered.map((admin) => (
                  <div className={styles.card} key={admin.id}>
                    <div>{admin.name ?? "—"}</div>
                    <div>{admin.email ?? "—"}</div>
                    <div>{formatDate(admin.created_at)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </TableCard>
      </div>

      <CreateAdminModal
        open={modals.adminModals.isCreateAdminOpen}
        onClose={modals.adminModals.closeCreateAdmin}
        onCreate={actions.createAdmin}
      />
    </AdminShell>
  );
}
