import React from "react";
import { SchemaField } from "@metastruct/expression-engine";
export interface WidgetProps {
    field: SchemaField;
    value: any;
    error?: string;
    onChange: (val: any) => void;
    disabled?: boolean;
}
export declare const StandardTextInput: React.FC<WidgetProps>;
export declare const StandardNumberInput: React.FC<WidgetProps>;
export declare const StandardSelectInput: React.FC<WidgetProps>;
/**
 * Array Repeater Widget: Handles dynamic multi-item entry
 * (e.g. List of Directors, Ultimate Beneficial Owners, or Bank Accounts)
 */
export declare const ArrayRepeaterWidget: React.FC<WidgetProps>;
export declare const WIDGET_REGISTRY: Record<string, React.FC<WidgetProps>>;
export declare const PlatformFieldRenderer: React.FC<WidgetProps>;
//# sourceMappingURL=WidgetRegistry.d.ts.map