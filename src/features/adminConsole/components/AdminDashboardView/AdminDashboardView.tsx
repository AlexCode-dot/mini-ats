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
  const { admins, createAdmin } = useAdminAdmins();
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
            <div className={styles.cardTitle}>Overview</div>
            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Customers</div>
                <div className={styles.metricValue}>
                  {data.organizations.length}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Admins</div>
                <div className={styles.metricValue}>{admins.length}</div>
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
          {!state.isLoading && !state.error && recent.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No customers yet</div>
              <div className={styles.emptyText}>
                Create a customer to see activity here.
              </div>
              <Button type="button" startIcon="+" onClick={modals.openCreateCustomer}>
                Create Customer
              </Button>
            </div>
          ) : null}
          {!state.isLoading && !state.error && recent.length > 0 ? (
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
