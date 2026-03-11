import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "@fluentui/react-theme";
import { CommentCard } from "./CommentCard";
import type { CommentRecord } from "../../types";

const useCommentListStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflowY: "auto",
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
    padding: tokens.spacingVerticalXXL,
  },
  nested: {
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
    marginLeft: tokens.spacingHorizontalL,
    paddingLeft: tokens.spacingHorizontalM,
  },
});

export interface ICommentListProps {
  comments: CommentRecord[];
  emptyMessage?: string;
  onReply?: (parentId: string, text: string) => void;
  onDelete?: (id: string) => void;
  onReplyStart?: () => void;
  onReplyEnd?: () => void;
  /** Internal — used to suppress the empty state message for nested lists */
  nested?: boolean;
}

export const CommentList: React.FC<ICommentListProps> = ({
  comments,
  emptyMessage = "No comments yet.",
  onReply,
  onDelete,
  onReplyStart,
  onReplyEnd,
  nested = false,
}) => {
  const styles = useCommentListStyles();

  if (comments.length === 0) {
    return nested ? null : <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.root}>
      {comments.map((comment) => (
        <div key={comment.id} className={styles.item}>
          <CommentCard comment={comment} onReply={onReply} onDelete={onDelete} onReplyStart={onReplyStart} onReplyEnd={onReplyEnd} />
          {comment.replies && comment.replies.length > 0 && (
            <div className={styles.nested}>
              <CommentList
                comments={comment.replies}
                onReply={onReply}
                onDelete={onDelete}
                onReplyStart={onReplyStart}
                onReplyEnd={onReplyEnd}
                nested
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
