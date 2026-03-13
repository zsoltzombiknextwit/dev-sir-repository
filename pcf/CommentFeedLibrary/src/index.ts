/**
 * CommentFeedLibrary
 * Shared components, hooks, and utilities for CommentFeedStandard and CommentFeedDataSet PCF controls.
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type { CommentRecord } from "./types";

// ── Components ────────────────────────────────────────────────────────────────
export { CommentCard, CommentList, CommentInput } from "./components";
export type { ICommentCardProps, ICommentListProps, ICommentInputProps } from "./components";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useComments } from "./hooks";
export type { UseCommentsOptions, UseCommentsResult } from "./hooks";

// ── Services ─────────────────────────────────────────────────────────────────
export { PcfContextProvider, usePcfContext } from "./services/pcfcontext/PcfContext";
export { PcfContextService } from "./services/pcfcontext/PcfContextService";

// ── Utils ─────────────────────────────────────────────────────────────────────
export { formatRelativeDate, getInitials } from "./utils";

// ── Fluent UI v9 re-exports (single bundle source) ────────────────────────────
// Controls import Fluent UI through this library to avoid duplicate bundling.
export { makeStyles } from "@griffel/react";
export { tokens } from "@fluentui/react-theme";
export {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Avatar,
  Body1,
  Caption1,
  Divider,
  Text,
  Textarea,
  Button,
  Spinner,
} from "@fluentui/react-components";

