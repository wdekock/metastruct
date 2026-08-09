import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Tooltip, } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SchemaIcon from "@mui/icons-material/Schema";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxIcon from "@mui/icons-material/AddBox";
export const EntityTreeSidebar = ({ nodes, selectedNodeId, onSelectNode, onAddEntity }) => {
    const [openNodes, setOpenNodes] = useState({ root: true });
    const [searchQuery, setSearchQuery] = useState("");
    const toggleNode = (nodeId) => {
        setOpenNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };
    const getNodeIcon = (type, isOpen) => {
        switch (type) {
            case "entity":
                return _jsx(SchemaIcon, { color: "primary", fontSize: "small" });
            case "sub-entity":
                return isOpen ? _jsx(FolderOpenIcon, { color: "action", fontSize: "small" }) : _jsx(FolderIcon, { color: "action", fontSize: "small" });
            case "workflow":
                return _jsx(AccountTreeIcon, { color: "secondary", fontSize: "small" });
            case "rules":
                return _jsx(ChecklistIcon, { color: "warning", fontSize: "small" });
        }
    };
    const renderTree = (items, level = 0) => {
        return items
            .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = !!openNodes[item.id];
            const isSelected = selectedNodeId === item.id;
            return (_jsxs(React.Fragment, { children: [_jsxs(ListItemButton, { selected: isSelected, onClick: () => {
                            if (hasChildren)
                                toggleNode(item.id);
                            onSelectNode(item.id, item.type);
                        }, sx: { pl: level * 2 + 2, py: 0.75, borderRadius: 1, mb: 0.5 }, children: [_jsx(Box, { sx: { display: "flex", alignItems: "center", mr: 1, visibility: hasChildren ? "visible" : "hidden" }, children: isOpen ? _jsx(ExpandMoreIcon, { fontSize: "small" }) : _jsx(ChevronRightIcon, { fontSize: "small" }) }), _jsx(ListItemIcon, { sx: { minWidth: 32 }, children: getNodeIcon(item.type, isOpen) }), _jsx(ListItemText, { primary: item.label, primaryTypographyProps: {
                                    variant: "body2",
                                    fontWeight: isSelected ? "bold" : "regular",
                                } })] }), hasChildren && (_jsx(Collapse, { in: isOpen, timeout: "auto", unmountOnExit: true, children: _jsx(List, { component: "div", disablePadding: true, children: renderTree(item.children, level + 1) }) }))] }, item.id));
        });
    };
    return (_jsxs(Paper, { variant: "outlined", sx: { width: 300, height: "100%", display: "flex", flexDirection: "column", p: 2, borderRadius: 0 }, children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: "Schema Entities" }), _jsx(Tooltip, { title: "Add New Sub-Entity", children: _jsx(IconButton, { size: "small", onClick: onAddEntity, color: "primary", children: _jsx(AddBoxIcon, {}) }) })] }), _jsx(TextField, { placeholder: "Search fields or models...", size: "small", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), fullWidth: true, sx: { mb: 2 }, InputProps: {
                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { fontSize: "small" }) })),
                } }), _jsx(Box, { sx: { flexGrow: 1, overflowY: "auto" }, children: _jsx(List, { disablePadding: true, children: renderTree(nodes) }) })] }));
};
