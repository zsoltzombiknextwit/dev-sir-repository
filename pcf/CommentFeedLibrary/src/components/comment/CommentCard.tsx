import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "@fluentui/react-theme";
import {
  Avatar, Body1, Caption1, Card, CardHeader, CardFooter, Link,
} from "@fluentui/react-components";
import { ConfirmationDialog } from "../dialogs/ConfirmationDialog";
import { UploadDialog } from "../dialogs/UploadDialog";
import { CommentMenu } from "../menus/CommentMenu";
import type { CommentRecord } from "../../types";
import { CommentInput, type ICommentInputRef } from "./CommentInput";

const useCommentCardStyles = makeStyles({
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  authorName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  timestamp: {
    color: tokens.colorNeutralForeground3,
  },
  replyContainer: {
    marginTop: tokens.spacingVerticalS,
  },
});

export interface ICommentCardProps {
  comment: CommentRecord;
  onReply?: (parentId: string, text: string) => void;
  onDelete?: (id: string) => void;
  onReplyStart?: () => void;
  onReplyEnd?: () => void;
}

export const CommentCard: React.FC<ICommentCardProps> = ({ comment, onReply, onDelete, onReplyStart, onReplyEnd }) => {
  const styles = useCommentCardStyles();
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const replyInputRef = React.useRef<ICommentInputRef>(null);

  const initials = comment.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleReplySubmit = (text: string) => {
    onReply?.(comment.id, text);
    setReplyOpen(false);
    onReplyEnd?.();
  };

  const hasReplies = (comment.replies?.length ?? 0) > 0;

  const handleDeleteConfirm = () => {
    onDelete?.(comment.id);
    setConfirmDeleteOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader
          image={<Avatar name={comment.authorName} initials={initials} size={32} />}
          header={
            <div className={styles.headerRow}>
              <Body1 className={styles.authorName}>{comment.authorName}</Body1>
              <Caption1 className={styles.timestamp}>{comment.createdOn.toLocaleString()}</Caption1>
            </div>
          }
          action={onDelete && (
            <CommentMenu
              hasReplies={hasReplies}
              onDeleteClick={() => setConfirmDeleteOpen(true)}
              onFieldsClick={(fieldName) => {
                if (replyOpen) {
                  replyInputRef.current?.appendText(` @${fieldName}`);
                }
              }}
            />
          )}
        />
        <Body1>{comment.text}</Body1>
        {replyOpen && (
          <div className={styles.replyContainer}>
            <CommentInput
              ref={replyInputRef}
              placeholder="Write a reply…"
              onSubmit={handleReplySubmit}
              onCancel={() => { setReplyOpen(false); onReplyEnd?.(); }}
            />
          </div>
        )}
        <CardFooter>
          {onReply && !replyOpen && (
            <Link onClick={() => { setReplyOpen(true); onReplyStart?.(); }}>Reply</Link>
          )}
          <Link onClick={() => setUploadOpen(true)}>Upload File</Link>
        </CardFooter>
      </Card>
      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete comment?"
        message="This action will permanently delete the comment record."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
      <UploadDialog
        open={uploadOpen}
        onUpload={(_files) => setUploadOpen(false)}
        onCancel={() => setUploadOpen(false)}
      />
    </>
  );
};
