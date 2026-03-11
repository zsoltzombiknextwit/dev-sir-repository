import * as React from "react";
import { makeStyles } from "@griffel/react";
import { tokens } from "@fluentui/react-theme";
import { Button, Caption1 } from "@fluentui/react-components";

const useCommentInputStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  charCount: {
    color: tokens.colorNeutralForeground3,
    textAlign: "right",
  },
  charCountOver: {
    color: tokens.colorStatusDangerForeground1,
    textAlign: "right",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sendButton: {
    backgroundColor: "#52AE30",
    color: "#ffffff",
    ":hover": {
      backgroundColor: "#47971f",
      color: "#ffffff",
    },
    ":active": {
      backgroundColor: "#3d8419",
      color: "#ffffff",
    },
  },
  textareaWrapper: {
    position: "relative",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  textareaWrapperFocused: {
    border: `1px solid ${tokens.colorBrandForeground1}`,
  },
  backdrop: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    padding: "8px 12px",
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    overflowY: "hidden",
    color: "transparent",
    pointerEvents: "none",
    userSelect: "none",
    borderRadius: tokens.borderRadiusMedium,
  },
  nativeTextarea: {
    display: "block",
    position: "relative",
    width: "100%",
    minHeight: "72px",
    padding: "8px 12px",
    margin: "0",
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "transparent",
    caretColor: tokens.colorNeutralForeground1,
    resize: "vertical",
    boxSizing: "border-box",
    overflowY: "auto",
    "::placeholder": {
      color: tokens.colorNeutralForeground3,
      opacity: 1,
    },
  },
});

export interface ICommentInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onCancel?: () => void;
}

export interface ICommentInputRef {
  appendText: (text: string) => void;
}

export const CommentInput = React.forwardRef<ICommentInputRef, ICommentInputProps>(function CommentInput({
  onSubmit,
  disabled = false,
  placeholder = "Write a comment…",
  onCancel,
}, ref) {
  const styles = useCommentInputStyles();
  const [text, setText] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => ({
    appendText: (value: string) => {
      setText((prev) => prev + value);
    },
  }));
  const MAX_CHARS = 2000;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const buildBackdropHtml = (value: string): string => {
    const escaped = value
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/@/g, `<span style="color:${tokens.colorBrandForeground1 || '#0078d4'}">@</span>`)
      .replace(/\n/g, "<br>");
    return escaped + "\u200b";
  };

  return (
    <div className={styles.root}>
      <div className={`${styles.textareaWrapper}${focused ? ` ${styles.textareaWrapperFocused}` : ""}`}>
        <div
          ref={backdropRef}
          className={styles.backdrop}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: buildBackdropHtml(text) }}
        />
        <textarea
          ref={textareaRef}
          className={styles.nativeTextarea}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
        />
      </div>
      <Caption1 className={text.length >= MAX_CHARS ? styles.charCountOver : styles.charCount}>
        {text.length}/{MAX_CHARS}
      </Caption1>
      <div className={styles.actions}>
        {onCancel && (
          <Button appearance="subtle" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        )}
        <Button
          appearance="primary"
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
});
