"use client";
import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CreateCustomerModal from "@/features/adminConsole/components/CreateCustomerModal/CreateCustomerModal";
import EditCustomerModal from "@/features/adminConsole/components/EditCustomerModal/EditCustomerModal";
import { useAdminCustomersView } from "@/features/adminConsole/hooks/useAdminCustomersView";
import styles from "@/features/adminConsole/components/AdminCustomersView/AdminCustomersView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import TableCard from "@/shared/components/TableCard/TableCard";
import Badge from "@/shared/components/Badge/Badge";
import LinkButton from "@/shared/components/LinkButton/LinkButton";
import ActionMenu from "@/shared/components/ActionMenu/ActionMenu";
import { formatDate } from "@/shared/utils/formatDate";

export default function AdminCustomersView() {
  const { state, filters, data, modals, actions } = useAdminCustomersView();

  return (
    <AdminShell title="Customers">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <SearchInput
            value={filters.query}
            onChange={(event) => filters.setQuery(event.target.value)}
            placeholder="Search customer name..."
          />
          <Button
            type="button"
            startIcon="+"
            onClick={modals.adminModals.openCreateCustomer}
          >
            Create Customer
          </Button>
        </div>

        <TableCard>
          <InlineError message={state.actionError} />
          <div className={styles.mobileList}>
            <InlineError message={state.error} />
          </div>
          {state.isLoading ? (
            <div className={styles.mobileList}>Loading...</div>
          ) : null}
          {!state.isLoading && !state.error && data.filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No customers yet</div>
              <div className={styles.emptyText}>
                Create your first customer to start managing jobs and candidates.
              </div>
              <Button
                type="button"
                startIcon="+"
                onClick={modals.adminModals.openCreateCustomer}
              >
                Create Customer
              </Button>
            </div>
          ) : null}
          {!state.isLoading && !state.error && data.filtered.length > 0 ? (
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
                  {data.filtered.map((org) => (
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
                          <ActionMenu
                            items={[
                              {
                                label: "Edit",
                                onClick: () => modals.openEditOrganization(org),
                              },
                              {
                                label: org.is_active
                                  ? "Deactivate"
                                  : "Activate",
                                disabled: state.savingOrgIds.includes(org.id),
                                onClick: () =>
                                  actions.toggleOrganization(
                                    org.id,
                                    !org.is_active
                                  ),
                              },
                            ]}
                          />
                          {state.savingOrgIds.includes(org.id) ? (
                            <span className={styles.saving}>Saving...</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.mobileList}>
                {data.filtered.map((org) => (
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
                        onClick={() => modals.openEditOrganization(org)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        disabled={state.savingOrgIds.includes(org.id)}
                        onClick={() =>
                          actions.toggleOrganization(org.id, !org.is_active)
                        }
                      >
                        {org.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      {state.savingOrgIds.includes(org.id) ? (
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
        onClick={modals.adminModals.openCreateCustomer}
      >
        +
      </Button>

      <CreateCustomerModal
        open={modals.adminModals.isCreateCustomerOpen}
        onClose={modals.adminModals.closeCreateCustomer}
        onCreate={actions.createOrganization}
      />
      <EditCustomerModal
        open={Boolean(modals.editingOrg)}
        organization={modals.editingOrg}
        onClose={modals.closeEditOrganization}
        onSave={actions.updateOrganization}
      />
    </AdminShell>
  );
}
