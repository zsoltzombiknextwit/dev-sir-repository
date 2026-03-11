import * as React from "react";
import {
  Button,
  Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
} from "@fluentui/react-components";
import { MoreHorizontalRegular, DeleteRegular, TextFieldRegular } from "@fluentui/react-icons";

export interface ICommentMenuProps {
  hasReplies: boolean;
  onDeleteClick: () => void;
  onFieldsClick: (fieldName: string) => void;
}

export const CommentMenu: React.FC<ICommentMenuProps> = ({ hasReplies, onDeleteClick, onFieldsClick }) => (
  <Menu>
    <MenuTrigger disableButtonEnhancement>
      <Button
        appearance="subtle"
        size="small"
        icon={<MoreHorizontalRegular />}
        aria-label="More options"
      />
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <MenuItem icon={<TextFieldRegular />}>Fields</MenuItem>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={() => onFieldsClick("field1")}>field1</MenuItem>
              <MenuItem onClick={() => onFieldsClick("field2")}>field2</MenuItem>
              <MenuItem onClick={() => onFieldsClick("field2")}>field2</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <MenuItem
          icon={<DeleteRegular />}
          disabled={hasReplies}
          onClick={onDeleteClick}
        >
          Delete
        </MenuItem>
      </MenuList>
    </MenuPopover>
  </Menu>
);
