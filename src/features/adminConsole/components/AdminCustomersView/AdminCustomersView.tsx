"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CreateCustomerModal from "@/features/adminConsole/components/CreateCustomerModal/CreateCustomerModal";
import EditCustomerModal from "@/features/adminConsole/components/EditCustomerModal/EditCustomerModal";
import { useAdminModals } from "@/features/adminConsole/hooks/useAdminModals";
import { useAdminOrganizations } from "@/features/adminConsole/hooks/useAdminOrganizations";
import type { AdminOrgRow } from "@/features/adminConsole/types";
import styles from "@/features/adminConsole/components/AdminCustomersView/AdminCustomersView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import TableCard from "@/shared/components/TableCard/TableCard";
import Badge from "@/shared/components/Badge/Badge";
import LinkButton from "@/shared/components/LinkButton/LinkButton";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export default function AdminCustomersView() {
  const [query, setQuery] = useState("");
  const [editingOrg, setEditingOrg] = useState<AdminOrgRow | null>(null);
  const [menuOrgId, setMenuOrgId] = useState<string | null>(null);
  const {
    organizations,
    isLoading,
    error,
    actionError,
    savingOrgIds,
    createOrganization,
    toggleOrganization,
    updateOrganization,
  } = useAdminOrganizations();
  const modals = useAdminModals();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return organizations;
    return organizations.filter((org) => org.name.toLowerCase().includes(term));
  }, [organizations, query]);

  useEffect(() => {
    if (!menuOrgId) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-admin-menu="true"]')) {
        return;
      }
      setMenuOrgId(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOrgId]);

  return (
    <AdminShell title="Customers">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer name..."
          />
          <Button
            type="button"
            startIcon="+"
            onClick={modals.openCreateCustomer}
          >
            Create Customer
          </Button>
        </div>

        <TableCard>
          <InlineError message={actionError} />
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
                    <th>Customer name</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Users</th>
                    <th>Jobs</th>
                    <th>Candidates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org) => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>{formatDate(org.created_at)}</td>
                      <td>
                        <Badge variant={org.is_active ? "active" : "inactive"}>
                          {org.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>{org.users_count}</td>
                      <td>{org.jobs_count}</td>
                      <td>{org.candidates_count}</td>
                      <td>
                        <div className={styles.actionRow}>
                          <LinkButton
                            href={`/admin/customers/${org.id}/candidates`}
                          >
                            Open ATS
                          </LinkButton>
                          <div className={styles.menu} data-admin-menu="true">
                            <button
                              type="button"
                              className={styles.menuButton}
                              onClick={() =>
                                setMenuOrgId((prev) =>
                                  prev === org.id ? null : org.id
                                )
                              }
                            >
                              ⋯
                            </button>
                            {menuOrgId === org.id ? (
                              <div className={styles.menuDropdown}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => {
                                    setMenuOrgId(null);
                                    setEditingOrg(org);
                                  }}
                                  className={styles.menuItem}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  disabled={savingOrgIds.includes(org.id)}
                                  onClick={() => {
                                    setMenuOrgId(null);
                                    toggleOrganization(org.id, !org.is_active);
                                  }}
                                  className={styles.menuItem}
                                >
                                  {org.is_active ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            ) : null}
                          </div>
                          {savingOrgIds.includes(org.id) ? (
                            <span className={styles.saving}>Saving...</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.mobileList}>
                {filtered.map((org) => (
                  <div className={styles.card} key={org.id}>
                    <div>{org.name}</div>
                    <Badge variant={org.is_active ? "active" : "inactive"}>
                      {org.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className={styles.countRow}>
                      <span>{org.jobs_count} jobs</span>
                      <span>{org.candidates_count} candidates</span>
                    </div>
                    <div className={styles.mobileActions}>
                      <LinkButton
                        href={`/admin/customers/${org.id}/candidates`}
                      >
                        Open ATS
                      </LinkButton>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setEditingOrg(org)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        disabled={savingOrgIds.includes(org.id)}
                        onClick={() =>
                          toggleOrganization(org.id, !org.is_active)
                        }
                      >
                        {org.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      {savingOrgIds.includes(org.id) ? (
                        <span className={styles.saving}>Saving...</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </TableCard>
      </div>

      <Button
        className={styles.fab}
        type="button"
        onClick={modals.openCreateCustomer}
      >
        +
      </Button>

      <CreateCustomerModal
        open={modals.isCreateCustomerOpen}
        onClose={modals.closeCreateCustomer}
        onCreate={createOrganization}
      />
      <EditCustomerModal
        open={Boolean(editingOrg)}
        organization={editingOrg}
        onClose={() => setEditingOrg(null)}
        onSave={updateOrganization}
      />
    </AdminShell>
  );
}
