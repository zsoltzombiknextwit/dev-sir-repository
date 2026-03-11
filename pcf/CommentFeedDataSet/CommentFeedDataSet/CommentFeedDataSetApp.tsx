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

export interface ICommentFeedDataSetAppProps {
  /** The PCF dataset property from the manifest. Used to derive regardingId and entity type. */
  sampleDataSet: ComponentFramework.PropertyTypes.DataSet;
  webApi: ComponentFramework.WebApi;
  currentUserName: string;
  currentUserId: string;
  allocatedHeight?: number;
  /** Fallback entity ID from the host form (context.page.entityId). */
  pageEntityId: string;
  /** Fallback entity type from the host form (context.page.entityTypeName). */
  pageEntityType: string;
}

export const CommentFeedDataSetApp: React.FC<ICommentFeedDataSetAppProps> = ({
  sampleDataSet,
  webApi,
  currentUserName,
  currentUserId,
  allocatedHeight,
  pageEntityId,
  pageEntityType,
}) => {
  const styles = useStyles();
  const containerHeight = allocatedHeight && allocatedHeight > 0 ? allocatedHeight : 400;
  const [isReplying, setIsReplying] = React.useState(false);

  // Derive regardingId and entity type from the first dataset record when available.
  // Falls back to the host form's page entity when the dataset is empty or still loading.
  const datasetReady = !sampleDataSet.loading && sampleDataSet.sortedRecordIds.length > 0;
  const regardingId = datasetReady
    ? sampleDataSet.sortedRecordIds[0]
    : pageEntityId;
  const regardingEntityType = datasetReady
    ? sampleDataSet.getTargetEntityType()
    : pageEntityType;

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
    <IdPrefixProvider value={`app-dataset-${regardingId}-`}>
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
          <CommentInput
            onSubmit={(text) => { void addComment(text, currentUserName, currentUserId); }}
            disabled={isLoading}
          />
        )}
      </FluentProvider>
    </IdPrefixProvider>
  );
};
