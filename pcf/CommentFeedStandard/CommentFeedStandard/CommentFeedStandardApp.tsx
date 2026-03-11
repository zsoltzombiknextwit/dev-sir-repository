import * as React from 'react';
import { IdPrefixProvider, FluentProvider, webLightTheme } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { CommentList, CommentInput, useComments } from 'comment-feed-library';

const useStyles = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  error: {
    color: 'red',
    padding: '8px',
  },
  body: {
    flex: '1 1 auto',
    overflow: 'auto',
    width: '100%',
  },
  loading: {
    padding: '16px',
  },
});

export interface ICommentFeedStandardProps {
  regardingId: string;
  regardingEntityType: string;
  webApi: ComponentFramework.WebApi;
  currentUserName: string;
  currentUserId: string;
  allocatedHeight?: number;
}

export const CommentFeedStandardApp: React.FC<ICommentFeedStandardProps> = ({
  regardingId,
  regardingEntityType,
  webApi,
  currentUserName,
  currentUserId,
  allocatedHeight,
}) => {
  const styles = useStyles();
  const containerHeight = allocatedHeight && allocatedHeight > 0 ? allocatedHeight : 400;
  const [isReplying, setIsReplying] = React.useState(false);
  const { comments, isLoading, error, addComment, deleteComment } = useComments({
    webApi,
    regardingId,
    regardingEntityType,
    tableName: "sir_requestcomment",
    idField: "activityid",
    textField: "sir_commenttext",
    subjectField: "subject",
    regardingNavProp: "_regardingobjectid_value",
    regardingBindField: `regardingobjectid_${regardingEntityType}_sir_requestcomment`,
    parentIdNavProp: "_sir_parentcomment_value",
    parentBindField: "sir_ParentComment_sir_RequestComment",
  });

  return (
    <IdPrefixProvider value={`app-${regardingId}-`}>
      <FluentProvider theme={webLightTheme} className={styles.root} style={{ height: containerHeight }}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.body}>
          {isLoading
            ? <div className={styles.loading}>Loading comments…</div>
            : <CommentList
              comments={comments}
              onReply={(parentId, text) => { void addComment(text, currentUserName, currentUserId, parentId); }}
              onDelete={(id) => { void deleteComment(id); }}
              onReplyStart={() => setIsReplying(true)}
              onReplyEnd={() => setIsReplying(false)}
            />
          }
        </div>
        {!isReplying && (
          <CommentInput onSubmit={(text) => { void addComment(text, currentUserName, currentUserId); }} disabled={isLoading} />
        )}
      </FluentProvider>
    </IdPrefixProvider>
  );
};

