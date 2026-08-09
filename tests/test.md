Testing and demonstrating what you have built is the best way to verify the integration across `@metastruct/expression-engine`, `@metastruct/platform-ui`, and `@metastruct/studio-ui`.

You can run both automated unit tests and a live visual UI workbench right inside your Codespace.

---

### Step 1: Run Automated Logic Verification

First, verify that the in-memory engine and graph cycle detector are passing. Run this in your Codespace terminal:

```bash
pnpm --filter @metastruct/expression-engine test

```

This tests:

* **Cycle Detection (DFS):** Confirms that circular logic paths (e.g., `Field A -> Field B -> Field A`) are intercepted before rendering.


* **Multi-Pass Resolution:** Confirms JSONata calculation rules converge deterministically across nested form values.



---

### Step 2: Spin Up the Live Interactive Workbench

To test the visual UI components interactively, start the web dev server:

```bash
pnpm --filter @metastruct/web dev

```

1. In Codespaces, VS Code will display a popup saying **"Your application running on port 5173 is available."**
2. Click **Open in Browser** (or navigate to the **Ports** tab in your Codespace terminal and click the Globe icon next to port `5173`).

---

### Step 3: What to Test in the Live UI

Once the browser opens, you will see the integrated `MetastructWorkbench` harness:

* **Left Sidebar (`studio-ui`):** Select different entity nodes in the tree to view structural field hierarchies.


* **Center Canvas (`studio-ui`):** Edit field definitions, JSONata expressions, and conditional visibility rules in real-time.


* **Right/Bottom Panel (`platform-ui`):** Interact with live Material UI input controls and array repeaters as the expression engine recalculates field values and visibility on the fly.



Would you like to walk through testing a specific scenario (e.g., adding a conditional field rule or testing an array repeater)?
