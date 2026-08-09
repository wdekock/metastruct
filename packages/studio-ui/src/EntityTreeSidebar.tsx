import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SchemaIcon from "@mui/icons-material/Schema";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxIcon from "@mui/icons-material/AddBox";

export interface EntityTreeNode {
  id: string;
  label: string;
  type: "entity" | "sub-entity" | "workflow" | "rules";
  children?: EntityTreeNode[];
}

export const EntityTreeSidebar: React.FC<{
  nodes: EntityTreeNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string, type: EntityTreeNode["type"]) => void;
  onAddEntity: () => void;
}> = ({ nodes, selectedNodeId, onSelectNode, onAddEntity }) => {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({ root: true });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleNode = (nodeId: string) => {
    setOpenNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const getNodeIcon = (type: EntityTreeNode["type"], isOpen: boolean) => {
    switch (type) {
      case "entity":
        return <SchemaIcon color="primary" fontSize="small" />;
      case "sub-entity":
        return isOpen ? <FolderOpenIcon color="action" fontSize="small" /> : <FolderIcon color="action" fontSize="small" />;
      case "workflow":
        return <AccountTreeIcon color="secondary" fontSize="small" />;
      case "rules":
        return <ChecklistIcon color="warning" fontSize="small" />;
    }
  };

  const renderTree = (items: EntityTreeNode[], level = 0) => {
    return items
      .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = !!openNodes[item.id];
        const isSelected = selectedNodeId === item.id;

        return (
          <React.Fragment key={item.id}>
            <ListItemButton
              selected={isSelected}
              onClick={() => {
                if (hasChildren) toggleNode(item.id);
                onSelectNode(item.id, item.type);
              }}
              sx={{ pl: level * 2 + 2, py: 0.75, borderRadius: 1, mb: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 1, visibility: hasChildren ? "visible" : "hidden" }}>
                {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </Box>

              <ListItemIcon sx={{ minWidth: 32 }}>{getNodeIcon(item.type, isOpen)}</ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: isSelected ? "bold" : "regular",
                }}
              />
            </ListItemButton>

            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderTree(item.children!, level + 1)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      });
  };

  return (
    <Paper
      variant="outlined"
      sx={{ width: 300, height: "100%", display: "flex", flexDirection: "column", p: 2, borderRadius: 0 }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Schema Entities
        </Typography>
        <Tooltip title="Add New Sub-Entity">
          <IconButton size="small" onClick={onAddEntity} color="primary">
            <AddBoxIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TextField
        placeholder="Search fields or models..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List disablePadding>{renderTree(nodes)}</List>
      </Box>
    </Paper>
  );
};
