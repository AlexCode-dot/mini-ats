"use client";

import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CreateAdminModal from "@/features/adminConsole/components/CreateAdminModal/CreateAdminModal";
import CreateCustomerModal from "@/features/adminConsole/components/CreateCustomerModal/CreateCustomerModal";
import { useAdminAdmins } from "@/features/adminConsole/hooks/useAdminAdmins";
import { useAdminModals } from "@/features/adminConsole/hooks/useAdminModals";
import { useAdminOrganizations } from "@/features/adminConsole/hooks/useAdminOrganizations";
import styles from "@/features/adminConsole/components/AdminDashboardView/AdminDashboardView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";
import TableCard from "@/shared/components/TableCard/TableCard";
import Badge from "@/shared/components/Badge/Badge";
import LinkButton from "@/shared/components/LinkButton/LinkButton";
import { formatDate } from "@/shared/utils/formatDate";

export default function AdminDashboardView() {
  const { state, data, actions } = useAdminOrganizations();
  const { createAdmin } = useAdminAdmins();
  const modals = useAdminModals();
  const recent = data.organizations.slice(0, 5);

  return (
    <AdminShell title="Dashboard">
      <div className={styles.page}>
        <section className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Quick Actions</div>
            <div className={styles.buttonRow}>
              <Button
                type="button"
                startIcon="+"
                onClick={modals.openCreateCustomer}
              >
                Create Customer
              </Button>
              <Button
                variant="secondary"
                type="button"
                startIcon="+"
                onClick={modals.openCreateAdmin}
              >
                Create Admin
              </Button>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>System Status</div>
            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✓</span>
                Supabase connected
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✓</span>
                RLS enabled
              </div>
            </div>
          </div>
        </section>

        <TableCard title="Recent Customers">
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
                    <th>Organization</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>#Jobs</th>
                    <th>#Candidates</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((org) => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>{formatDate(org.created_at)}</td>
                      <td>
                        <Badge variant={org.is_active ? "active" : "inactive"}>
                          {org.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>{org.jobs_count}</td>
                      <td>{org.candidates_count}</td>
                      <td>
                        <LinkButton
                          href={`/admin/customers/${org.id}/candidates`}
                        >
                          Open ATS
                        </LinkButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.mobileList}>
                {recent.map((org) => (
                  <div className={styles.mobileCard} key={org.id}>
                    <div>{org.name}</div>
                    <Badge variant={org.is_active ? "active" : "inactive"}>
                      {org.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className={styles.countRow}>
                      <span>{org.jobs_count} jobs</span>
                      <span>{org.candidates_count} candidates</span>
                    </div>
                    <LinkButton href={`/admin/customers/${org.id}/candidates`}>
                      Open ATS
                    </LinkButton>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </TableCard>
      </div>

      <CreateCustomerModal
        open={modals.isCreateCustomerOpen}
        onClose={modals.closeCreateCustomer}
        onCreate={actions.createOrganization}
      />
      <CreateAdminModal
        open={modals.isCreateAdminOpen}
        onClose={modals.closeCreateAdmin}
        onCreate={createAdmin}
      />
    </AdminShell>
  );
}
