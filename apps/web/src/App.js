import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Paper, Grid, Divider, Typography, Tab, Tabs } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BuildIcon from "@mui/icons-material/Build";
import { ExpressionEngine } from "@metastruct/expression-engine";
import { PlatformFieldRenderer } from "@metastruct/platform-ui";
import { StudioLayoutShell, SchemaFieldCanvas } from "@metastruct/studio-ui";
const INITIAL_SCHEMA = {
    $schemaVersion: "1.0.0",
    id: "fund_onboarding_schema",
    title: "Fund Onboarding Questionnaire",
    fields: {
        entityType: {
            id: "entityType",
            type: "string",
            label: "Entity Legal Structure",
            component: "SelectInput",
            options: [
                { label: "Private Company (Pty Ltd)", value: "PTY_LTD" },
                { label: "Trust", value: "TRUST" },
                { label: "Individual Investor", value: "INDIVIDUAL" },
            ],
            required: true,
        },
        investmentAmount: {
            id: "investmentAmount",
            type: "number",
            label: "Initial Investment ($)",
            component: "NumberInput",
            required: true,
        },
        managementFee: {
            id: "managementFee",
            type: "number",
            label: "Calculated Fee Rate (%)",
            component: "NumberInput",
            calculationRule: "investmentAmount >= 1000000 ? 1.5 : 2.0",
        },
    },
    steps: [
        {
            id: "step_1",
            title: "General Configuration",
            fields: ["entityType", "investmentAmount", "managementFee"],
        },
    ],
};
export const MetastructWorkbench = () => {
    const [activeTab, setActiveTab] = useState("builder");
    const [schema, setSchema] = useState(INITIAL_SCHEMA);
    const [formData, setFormData] = useState({
        entityType: "PTY_LTD",
        investmentAmount: 500000,
    });
    const [computedState, setComputedState] = useState({});
    const [errors, setErrors] = useState({});
    const [visibleFields, setVisibleFields] = useState([]);
    useEffect(() => {
        let isMounted = true;
        const engine = new ExpressionEngine(schema);
        engine.evaluate(formData).then((res) => {
            if (!isMounted)
                return;
            setComputedState(res.computedData || {});
            setErrors(res.errors || {});
            setVisibleFields(res.visibleFields || []);
        });
        return () => {
            isMounted = false;
        };
    }, [schema, formData]);
    const handleFieldChange = (fieldId, val) => {
        setFormData((prev) => ({ ...prev, [fieldId]: val }));
    };
    return (_jsxs(StudioLayoutShell, { children: [_jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", mb: 3 }, children: _jsxs(Tabs, { value: activeTab, onChange: (_, val) => setActiveTab(val), children: [_jsx(Tab, { icon: _jsx(BuildIcon, {}), iconPosition: "start", label: "Studio Field Editor", value: "builder" }), _jsx(Tab, { icon: _jsx(PlayArrowIcon, {}), iconPosition: "start", label: "Live Form Preview", value: "preview" })] }) }), activeTab === "builder" && (_jsx(Paper, { variant: "outlined", sx: { p: 3, borderRadius: 2 }, children: _jsx(SchemaFieldCanvas, { schema: schema, onSchemaChange: (updated) => setSchema(updated) }) })), activeTab === "preview" && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 7, children: _jsxs(Paper, { variant: "outlined", sx: { p: 3, borderRadius: 2 }, children: [_jsx(Typography, { variant: "h6", fontWeight: "bold", gutterBottom: true, children: schema.title }), _jsx(Divider, { sx: { mb: 3 } }), Object.entries(schema.fields || {}).map(([fieldId, field]) => {
                                    if (!visibleFields.includes(fieldId))
                                        return null;
                                    return (_jsx(PlatformFieldRenderer, { field: field, value: computedState[fieldId], error: errors[fieldId], onChange: (val) => handleFieldChange(fieldId, val), disabled: !!field.calculationRule }, fieldId));
                                })] }) }), _jsx(Grid, { item: true, xs: 12, md: 5, children: _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, bgcolor: "grey.900", color: "grey.100", borderRadius: 2 }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", gutterBottom: true, color: "secondary.main", children: "Live Evaluated Output State" }), _jsx(Box, { component: "pre", sx: {
                                        fontFamily: "monospace",
                                        fontSize: "0.75rem",
                                        m: 0,
                                        p: 1.5,
                                        bgcolor: "rgba(255,255,255,0.05)",
                                        borderRadius: 1,
                                        overflowX: "auto",
                                    }, children: JSON.stringify(computedState, null, 2) })] }) })] }))] }));
};
export default MetastructWorkbench;
