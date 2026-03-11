import * as React from "react";
import {
  Button,
  Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
} from "@fluentui/react-components";

export interface IConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<IConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => (
  <Dialog
    modalType="alert"
    open={open}
    onOpenChange={(_, data) => { if (!data.open) onCancel(); }}
  >
    <DialogSurface>
      <DialogBody>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button appearance="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button appearance="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);
