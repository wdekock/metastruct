import React from "react";
export interface StepperStep {
    id: string;
    label: string;
    fieldCount: number;
    hasVisibilityRule?: boolean;
}
export declare const StudioStepperBar: React.FC<{
    steps: StepperStep[];
    activeStepIndex: number;
    orientation: "horizontal" | "vertical";
    onStepClick: (index: number) => void;
    onOrientationChange: (mode: "horizontal" | "vertical") => void;
}>;
//# sourceMappingURL=StudioStepperBar.d.ts.map