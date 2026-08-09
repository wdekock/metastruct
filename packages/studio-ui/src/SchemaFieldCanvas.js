import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Button, IconButton, Grid, Chip, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Divider, Stack, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FunctionsIcon from "@mui/icons-material/Functions";
import VisibilityIcon from "@mui/icons-material/Visibility";
const COMPONENT_OPTIONS = [
    { label: "Text Field", value: "TextInput", type: "string" },
    { label: "Number Input", value: "NumberInput", type: "number" },
    { label: "Select Dropdown", value: "SelectInput", type: "string" },
    { label: "Array Repeater", value: "ArrayRepeater", type: "array" },
];
export const SchemaFieldCanvas = ({ schema, onSchemaChange }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState(null);
    const [fieldForm, setFieldForm] = useState({
        id: "",
        label: "",
        type: "string",
        component: "TextInput",
        required: false,
        calculationRule: "",
        visibilityRule: "",
    });
    const handleOpenAddDialog = () => {
        setEditingFieldId(null);
        setFieldForm({
            id: "",
            label: "",
            type: "string",
            component: "TextInput",
            required: false,
            calculationRule: "",
            visibilityRule: "",
        });
        setDialogOpen(true);
    };
    const handleOpenEditDialog = (fieldId) => {
        const field = schema?.fields?.[fieldId];
        if (!field)
            return;
        setEditingFieldId(fieldId);
        setFieldForm({ ...field });
        setDialogOpen(true);
    };
    const handleSaveField = () => {
        if (!fieldForm.id || !fieldForm.label)
            return;
        const newFieldId = fieldForm.id.trim().replace(/\s+/g, "_").toLowerCase();
        const updatedFields = { ...(schema?.fields || {}) };
        if (editingFieldId && editingFieldId !== newFieldId) {
            delete updatedFields[editingFieldId];
        }
        updatedFields[newFieldId] = {
            id: newFieldId,
            label: fieldForm.label,
            type: fieldForm.type || "string",
            component: fieldForm.component || "TextInput",
            required: !!fieldForm.required,
            calculationRule: fieldForm.calculationRule || undefined,
            visibilityRule: fieldForm.visibilityRule || undefined,
        };
        const updatedSteps = [...(schema?.steps || [])];
        if (updatedSteps.length > 0) {
            const stepIndex = updatedSteps.findIndex((s) => s.fields.includes(newFieldId));
            if (stepIndex === -1) {
                updatedSteps[0] = {
                    ...updatedSteps[0],
                    fields: [...updatedSteps[0].fields, newFieldId],
                };
            }
        }
        onSchemaChange({
            ...schema,
            fields: updatedFields,
            steps: updatedSteps,
        });
        setDialogOpen(false);
    };
    const handleDeleteField = (fieldId) => {
        const updatedFields = { ...(schema?.fields || {}) };
        delete updatedFields[fieldId];
        const updatedSteps = (schema?.steps || []).map((step) => ({
            ...step,
            fields: step.fields.filter((f) => f !== fieldId),
        }));
        onSchemaChange({
            ...schema,
            fields: updatedFields,
            steps: updatedSteps,
        });
    };
    const fieldEntries = Object.entries(schema?.fields || {});
    return (_jsxs(Box, { sx: { width: "100%" }, children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", fontWeight: "bold", children: "Schema Field Canvas" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Visually configure target entity fields, JSONata formulas, and conditional rules." })] }), _jsx(Button, { variant: "contained", disableElevation: true, startIcon: _jsx(AddIcon, {}), onClick: handleOpenAddDialog, children: "Add Field" })] }), _jsx(Grid, { container: true, spacing: 2, children: fieldEntries.map(([fieldId, field]) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsxs(Card, { variant: "outlined", sx: { borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }, children: [_jsxs(CardContent, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", noWrap: true, children: field.label }), _jsx(Chip, { label: field.component, size: "small", color: "primary", variant: "outlined", sx: { fontSize: "0.7rem", height: 22 } })] }), _jsxs(Typography, { variant: "caption", fontFamily: "monospace", color: "text.secondary", display: "block", sx: { mb: 1.5 }, children: ["id: ", field.id] }), _jsxs(Stack, { spacing: 0.5, children: [field.required && (_jsx(Chip, { label: "Required", size: "small", color: "error", variant: "filled", sx: { height: 20, width: "fit-content", fontSize: "0.65rem" } })), field.calculationRule && (_jsxs(Box, { sx: { display: "flex", alignItems: "center", bgcolor: "amber.50", color: "warning.dark", p: 0.75, borderRadius: 1 }, children: [_jsx(FunctionsIcon, { fontSize: "inherit", sx: { mr: 0.5 } }), _jsx(Typography, { variant: "caption", fontFamily: "monospace", noWrap: true, title: field.calculationRule, children: field.calculationRule })] })), field.visibilityRule && (_jsxs(Box, { sx: { display: "flex", alignItems: "center", bgcolor: "info.50", color: "info.dark", p: 0.75, borderRadius: 1 }, children: [_jsx(VisibilityIcon, { fontSize: "inherit", sx: { mr: 0.5 } }), _jsx(Typography, { variant: "caption", fontFamily: "monospace", noWrap: true, title: field.visibilityRule, children: field.visibilityRule })] }))] })] }), _jsx(Divider, {}), _jsxs(CardActions, { sx: { justifyContent: "flex-end", px: 1.5, py: 0.5 }, children: [_jsx(IconButton, { size: "small", onClick: () => handleOpenEditDialog(fieldId), children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDeleteField(fieldId), children: _jsx(DeleteIcon, { fontSize: "small" }) })] })] }) }, fieldId))) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingFieldId ? "Edit Schema Field" : "Create Schema Field" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 2.5, sx: { mt: 0.5 }, children: [_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Field ID (Key)", value: fieldForm.id, onChange: (e) => setFieldForm({ ...fieldForm, id: e.target.value }), placeholder: "e.g. tax_registration_number", disabled: !!editingFieldId }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Display Label", value: fieldForm.label, onChange: (e) => setFieldForm({ ...fieldForm, label: e.target.value }), placeholder: "e.g. Tax Registration Number" }) })] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { select: true, fullWidth: true, size: "small", label: "UI Component Widget", value: fieldForm.component, onChange: (e) => {
                                                    const comp = COMPONENT_OPTIONS.find((c) => c.value === e.target.value);
                                                    setFieldForm({
                                                        ...fieldForm,
                                                        component: e.target.value,
                                                        type: comp ? comp.type : "string",
                                                    });
                                                }, children: COMPONENT_OPTIONS.map((opt) => (_jsx(MenuItem, { value: opt.value, children: opt.label }, opt.value))) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: !!fieldForm.required, onChange: (e) => setFieldForm({ ...fieldForm, required: e.target.checked }) }), label: "Mandatory Field", sx: { mt: 0.5 } }) })] }), _jsx(Divider, {}), _jsx(Typography, { variant: "subtitle2", fontWeight: "bold", children: "Expression Engine Rules (JSONata Syntax)" }), _jsx(TextField, { fullWidth: true, size: "small", label: "Calculation Formula (Optional)", value: fieldForm.calculationRule || "", onChange: (e) => setFieldForm({ ...fieldForm, calculationRule: e.target.value }), placeholder: "e.g. investmentAmount >= 1000000 ? 1.5 : 2.0", helperText: "If specified, this field becomes auto-calculated and read-only." }), _jsx(TextField, { fullWidth: true, size: "small", label: "Visibility Condition (Optional)", value: fieldForm.visibilityRule || "", onChange: (e) => setFieldForm({ ...fieldForm, visibilityRule: e.target.value }), placeholder: "e.g. entityType = 'PTY_LTD' or entityType = 'TRUST'", helperText: "Field will remain hidden until this expression evaluates to true." })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setDialogOpen(false), children: "Cancel" }), _jsx(Button, { variant: "contained", disableElevation: true, onClick: handleSaveField, children: "Save Field" })] })] })] }));
};
