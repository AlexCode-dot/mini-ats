"use client";

import { useMemo, useState } from "react";

import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CreateAdminModal from "@/features/adminConsole/components/CreateAdminModal/CreateAdminModal";
import { useAdminAdmins } from "@/features/adminConsole/hooks/useAdminAdmins";
import { useAdminModals } from "@/features/adminConsole/hooks/useAdminModals";
import styles from "@/features/adminConsole/components/AdminAdminsView/AdminAdminsView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import TableCard from "@/shared/components/TableCard/TableCard";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export default function AdminAdminsView() {
  const { admins, isLoading, error, createAdmin } = useAdminAdmins();
  const modals = useAdminModals();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return admins;
    return admins.filter((admin) => {
      const name = admin.name?.toLowerCase() ?? "";
      const email = admin.email?.toLowerCase() ?? "";
      return name.includes(term) || email.includes(term);
    });
  }, [admins, query]);

  return (
    <AdminShell title="Admin Users">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search admin..."
          />
          <Button type="button" startIcon="+" onClick={modals.openCreateAdmin}>
            Create Admin
          </Button>
        </div>
        <TableCard>
          <div className={styles.mobileList}>
            <InlineError message={error} />
          </div>
          {isLoading ? (
            <div className={styles.mobileList}>Loading...</div>
          ) : null}
          {!isLoading && !error ? (
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
                  {filtered.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.name ?? "—"}</td>
                      <td>{admin.email ?? "—"}</td>
                      <td>{formatDate(admin.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.mobileList}>
                {filtered.map((admin) => (
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
        open={modals.isCreateAdminOpen}
        onClose={modals.closeCreateAdmin}
        onCreate={createAdmin}
      />
    </AdminShell>
  );
}
