import React, { createContext, useContext, useState } from "react";
import { defaultDomainSchema } from "../manifests/sampleManifest";

interface SelectedNode {
  id: string;
  type: "entity" | "field" | "workflow";
  data: any;
}

interface ManifestContextType {
  manifest: any;
  setManifest: React.Dispatch<React.SetStateAction<any>>;
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
  activeView: number;
  setActiveView: (view: number) => void;
}

const ManifestContext = createContext<ManifestContextType | undefined>(undefined);

export const ManifestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manifest, setManifest] = useState<any>(defaultDomainSchema);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>({
    id: "projectName",
    type: "field",
    data: defaultDomainSchema.properties.projectName,
  });
  const [activeView, setActiveView] = useState<number>(0);

  return (
    <ManifestContext.Provider
      value={{
        manifest,
        setManifest,
        selectedNode,
        setSelectedNode,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </ManifestContext.Provider>
  );
};

export const useManifest = () => {
  const context = useContext(ManifestContext);
  if (!context) {
    throw new Error("useManifest must be used within a ManifestProvider");
  }
  return context;
};
