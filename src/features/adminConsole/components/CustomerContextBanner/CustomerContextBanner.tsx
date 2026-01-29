"use client";

import styles from "@/features/adminConsole/components/CustomerContextBanner/CustomerContextBanner.module.scss";
import type { AdminOrgRow } from "@/features/adminConsole/types";
import Button from "@/shared/components/Button/Button";

type CustomerContextBannerProps = {
  orgId: string;
  orgName: string;
  organizations: AdminOrgRow[];
  onSwitchOrg: (orgId: string) => void;
  onExit: () => void;
};

export default function CustomerContextBanner({
  orgId,
  orgName,
  organizations,
  onSwitchOrg,
  onExit,
}: CustomerContextBannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <span>Managing: {orgName}</span>
        <select
          className={styles.select}
          value={orgId}
          onChange={(event) => onSwitchOrg(event.target.value)}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <Button variant="inverse" size="sm" startIcon="×" onClick={onExit}>
        Exit customer context
      </Button>
    </div>
  );
}
