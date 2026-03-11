import * as React from "react";
import type { CommentRecord } from "../types";

export interface UseCommentsOptions {
  /** Dataverse WebAPI instance from the PCF context */
  webApi: ComponentFramework.WebApi;
  /** ID of the record to load comments for */
  regardingId: string;
  /** Entity type of the regarding record (e.g. "incident"). Used to build the odata.bind path on create. */
  regardingEntityType?: string;
  /** Logical name of the comment entity. Default: "sir_comment" */
  tableName?: string;
  /** Primary key field of the comment entity. Default: "sir_commentid" */
  idField?: string;
  /** Text body field of the comment entity. Default: "sir_commenttext" */
  textField?: string;
  /** OData nav property holding the parent comment lookup ID. Default: "_sir_parentcomment_value" */
  parentIdNavProp?: string;
  /** Field name for the parent self-reference odata.bind on create. Default: "sir_parentcomment" */
  parentBindField?: string;
  /** OData nav property used to filter comments by regardingId. Default: "_sir_regardingid_value" */
  regardingNavProp?: string;
  /** Field name for the regarding lookup odata.bind on create. Default: "sir_regardingid" */
  regardingBindField?: string;
  /** Optional field name for the activity subject (e.g. "subject" on Dataverse activity entities). When provided, the comment text is also written to this field on create. */
  subjectField?: string;
}

export interface UseCommentsResult {
  comments: CommentRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  addComment: (text: string, authorName: string, authorId?: string, parentId?: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
}

function buildTree(flat: CommentRecord[]): CommentRecord[] {
  const map = new Map<string, CommentRecord>(
    flat.map((c) => [c.id, { ...c, replies: [] }])
  );
  const roots: CommentRecord[] = [];
  map.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) {
        parent.replies!.push(c);
      } else {
        roots.push(c); // orphaned reply — treat as root
      }
    } else {
      roots.push(c);
    }
  });
  return roots;
}

export function useComments({
  webApi,
  regardingId,
  regardingEntityType = "",
  tableName = "sir_comment",
  idField = "sir_commentid",
  textField = "sir_commenttext",
  parentIdNavProp = "_sir_parentcomment_value",
  parentBindField = "sir_parentcomment",
  regardingNavProp = "_sir_regardingid_value",
  regardingBindField = "sir_regardingid",
  subjectField,
}: UseCommentsOptions): UseCommentsResult {
  const tableSetName = `${tableName}s`;
  const regardingEntitySet = regardingEntityType ? `${regardingEntityType}s` : "";

  // Strip curly braces that PCF sometimes includes in entity IDs (e.g. from context.page.entityId).
  const cleanId = regardingId.replace(/[{}]/g, "");

  const [comments, setComments] = React.useState<CommentRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!cleanId) return;
    setIsLoading(true);
    setError(null);
    try {
      const select = `$select=${idField},${textField},createdon,modifiedon,_createdby_value,${parentIdNavProp}`;
      const filter = `$filter=${regardingNavProp} eq ${cleanId}`;
      const orderby = `$orderby=createdon asc`;
      const result = await webApi.retrieveMultipleRecords(
        tableName,
        `?${select}&${filter}&${orderby}`
      );
      const flat: CommentRecord[] = result.entities.map((e) => ({
        id: e[idField] as string,
        text: (e[textField] as string) ?? "",
        authorName:
          (e["_createdby_value@OData.Community.Display.V1.FormattedValue"] as string) ?? "Unknown",
        authorId: e["_createdby_value"] as string | undefined,
        createdOn: new Date(e["createdon"] as string),
        modifiedOn: e["modifiedon"] ? new Date(e["modifiedon"] as string) : undefined,
        parentId: (e[parentIdNavProp] as string | null) ?? undefined,
      }));
      setComments(buildTree(flat));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  }, [webApi, cleanId, tableName, idField, textField, parentIdNavProp, regardingNavProp]);

  React.useEffect(() => {
    load();
  }, [load]);

  const addComment = React.useCallback(
    async (text: string, authorName: string, authorId?: string, parentId?: string) => {
      setError(null);
      try {
        const record: Record<string, string> = { [textField]: text };
        if (subjectField) {
          record[subjectField] = text;
        }
        if (cleanId && regardingEntitySet) {
          record[`${regardingBindField}@odata.bind`] = `/${regardingEntitySet}(${cleanId})`;
        }
        if (parentId) {
          const cleanParentId = parentId.replace(/[{}]/g, "");
          record[`${parentBindField}@odata.bind`] = `/${tableSetName}(${cleanParentId})`;
        }
        await webApi.createRecord(tableName, record);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save comment.");
      }
    },
    [webApi, cleanId, tableName, tableSetName, regardingEntitySet, textField, regardingBindField, parentBindField, subjectField, load]
  );

  const deleteComment = React.useCallback(
    async (id: string) => {
      setError(null);
      try {
        const cleanRecordId = id.replace(/[{}]/g, "");
        await webApi.deleteRecord(tableName, cleanRecordId);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete comment.");
      }
    },
    [webApi, tableName, load]
  );

  return { comments, isLoading, error, refresh: load, addComment, deleteComment };
}
