import type { InputHTMLAttributes } from "react";

import styles from "@/shared/components/SearchInput/SearchInput.module.scss";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export default function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={[styles.search, className ?? ""].filter(Boolean).join(" ")}>
      <input {...props} />
    </div>
  );
}
