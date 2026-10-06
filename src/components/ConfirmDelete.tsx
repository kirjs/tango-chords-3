import { useEffect, useRef, useState } from "react";
import type { Song } from "../types";
import styles from "./ConfirmDelete.module.scss";

interface Props {
  song: Song;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

// Modal confirmation; the destructive action is never the default button.
export default function ConfirmDelete({ song, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const confirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(
        code === "permission-denied"
          ? "You don't have permission to delete this song."
          : "The song couldn't be deleted. Check your connection and try again.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!isDeleting) onCancel();
      }}
      aria-labelledby="confirm-delete-title"
    >
      <h2 id="confirm-delete-title">Delete “{song.data.title}”?</h2>
      <p>It will be removed for everyone. This can't be undone.</p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttons}>
        <button onClick={onCancel} disabled={isDeleting} autoFocus>
          Cancel
        </button>
        <button className={styles.delete} onClick={confirm} disabled={isDeleting}>
          {isDeleting ? "Deleting…" : "Delete song"}
        </button>
      </div>
    </dialog>
  );
}
