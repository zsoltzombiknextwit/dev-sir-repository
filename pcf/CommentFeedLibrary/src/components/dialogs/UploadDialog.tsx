import * as React from "react";
import { makeStyles, shorthands } from "@griffel/react";
import { tokens } from "@fluentui/react-theme";
import {
  Body1, Button, Caption1,
  Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
} from "@fluentui/react-components";
import {
  ArrowUploadRegular, DismissRegular, DocumentRegular,
  ImageRegular, VideoRegular, MusicNote2Regular, ArchiveRegular,
  CodeRegular, TableRegular, DocumentTextRegular, DocumentPdfRegular,
} from "@fluentui/react-icons";

const useUploadDialogStyles = makeStyles({
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingVerticalS,
    minHeight: "140px",
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalL,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground2,
    ":hover": {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
  dropZoneActive: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground2,
  },
  dropZoneHint: {
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },
  uploadIcon: {
    fontSize: "32px",
    color: tokens.colorNeutralForeground3,
  },
  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    marginTop: tokens.spacingVerticalS,
    maxHeight: "160px",
    overflowY: "auto",
  },
  fileItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  fileIcon: {
    fontSize: "16px",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
  },
  extBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1px 5px",
    borderRadius: tokens.borderRadiusSmall,
    fontSize: "10px",
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: "16px",
    color: "#ffffff",
    flexShrink: 0,
    minWidth: "30px",
  },
  fileName: {
    flex: "1 1 auto",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  removeButton: {
    flexShrink: 0,
    minWidth: "unset",
    padding: "2px",
  },
  hiddenInput: {
    display: "none",
  },
  uploadButton: {
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
});

export interface IUploadDialogProps {
  open: boolean;
  onUpload: (files: File[]) => void;
  onCancel: () => void;
}

function getFileIconInfo(fileName: string): { IconComponent: React.ElementType; color: string; ext: string } {
  const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";

  if (ext === "pdf") return { IconComponent: DocumentPdfRegular, color: "#d13438", ext };
  if (["jpg","jpeg","png","gif","svg","webp","bmp","ico","tiff"].includes(ext))
    return { IconComponent: ImageRegular, color: "#0078d4", ext };
  if (["mp4","mov","avi","mkv","wmv","flv","webm"].includes(ext))
    return { IconComponent: VideoRegular, color: "#8764b8", ext };
  if (["mp3","wav","ogg","flac","aac","m4a","wma"].includes(ext))
    return { IconComponent: MusicNote2Regular, color: "#038387", ext };
  if (["zip","rar","7z","tar","gz","bz2"].includes(ext))
    return { IconComponent: ArchiveRegular, color: "#ca5010", ext };
  if (["js","ts","tsx","jsx","html","css","json","xml","py","cs","java","cpp","c","h","sql"].includes(ext))
    return { IconComponent: CodeRegular, color: "#00b7c3", ext };
  if (["xlsx","xls","csv"].includes(ext))
    return { IconComponent: TableRegular, color: "#107c10", ext };
  if (["txt","doc","docx","md","rtf"].includes(ext))
    return { IconComponent: DocumentTextRegular, color: "#0078d4", ext };

  return { IconComponent: DocumentRegular, color: "#616161", ext };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const UploadDialog: React.FC<IUploadDialogProps> = ({ open, onUpload, onCancel }) => {
  const styles = useUploadDialogStyles();
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles = Array.from(incoming);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset so the same file can be re-selected if removed
    e.target.value = "";
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    onUpload(files);
    setFiles([]);
  };

  const handleCancel = () => {
    setFiles([]);
    onCancel();
  };

  return (
    <Dialog
      modalType="non-modal"
      open={open}
      onOpenChange={(_, data) => { if (!data.open) handleCancel(); }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogContent>
            <div
              className={`${styles.dropZone}${isDragOver ? ` ${styles.dropZoneActive}` : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleZoneClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleZoneClick(); }}
              aria-label="Drop files here or click to browse"
            >
              <ArrowUploadRegular className={styles.uploadIcon} />
              <Body1 className={styles.dropZoneHint}>
                Drag &amp; drop files here
              </Body1>
              <Caption1 className={styles.dropZoneHint}>
                or click to browse
              </Caption1>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className={styles.hiddenInput}
              onChange={handleFileInputChange}
              aria-hidden="true"
              tabIndex={-1}
            />
            {files.length > 0 && (
              <div className={styles.fileList}>
                {files.map((file, index) => {
                  const { IconComponent, color: iconColor, ext } = getFileIconInfo(file.name);
                  return (
                  <div key={`${file.name}-${index}`} className={styles.fileItem}>
                    <IconComponent className={styles.fileIcon} style={{ color: iconColor }} />
                    {ext && (
                      <span className={styles.extBadge} style={{ backgroundColor: iconColor }}>
                        {ext.toUpperCase()}
                      </span>
                    )}
                    <Body1 className={styles.fileName} title={file.name}>
                      {file.name}
                    </Body1>
                    <Caption1 className={styles.fileSize}>
                      {formatFileSize(file.size)}
                    </Caption1>
                    <Button
                      appearance="subtle"
                      size="small"
                      className={styles.removeButton}
                      icon={<DismissRegular />}
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    />
                  </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              className={styles.uploadButton}
              icon={<ArrowUploadRegular />}
              onClick={handleUpload}
              disabled={files.length === 0}
            >
              Upload
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
