import fs from "fs";
import path from "path";
import { buildInitialGraph } from "../dist/analyzer.js";
import { toMcpUiDashboard } from "../dist/exporters/mcp-ui-dashboard.js";
import { toMermaid } from "../dist/exporters/mermaid.js";

// Sample story text for testing
const storyText = `
Title: The Hero's Journey

Character: Luke Skywalker, role: protagonist
Character: Darth Vader, role: antagonist
Character: Obi-Wan Kenobi, role: mentor

Event: Inciting Incident - Luke discovers the droids
Event: Meeting with Mentor - Obi-Wan reveals the Force
Event: Midpoint - Luke learns the truth about his father
Event: Climax - Final confrontation with Vader
Event: Resolution - Luke embraces his destiny

Conflict: Luke vs the Empire
Conflict: Luke's internal struggle with the dark side
`;

/**
 * Generate HTML outputs (MCP UI dashboard, standalone Mermaid page, and a combined tabbed page) from the embedded story text and save them to ./test-output.
 * @returns {{dashboardPath: string, mermaidHtmlPath: string, combinedPath: string, graph: Object}} An object containing the filesystem paths of the written files and the generated story graph.
 * @throws {Error} If an error occurs during graph construction, export, or file I/O.
 */
async function generateDashboard() {
	try {
		// Build the story graph
		const graph = buildInitialGraph(storyText);
		graph.meta.createdAt = new Date().toISOString();
		graph.meta.updatedAt = new Date().toISOString();

		// Generate MCP UI Dashboard HTML
		const dashboardHtml = toMcpUiDashboard(graph, {
			includeStats: true,
			includeRecommendations: true,
		});

		// Generate Mermaid diagram
		const mermaidDiagram = toMermaid(graph, {
			includeMetadata: true,
			style: "default",
		});

		// Create output directory
		const outputDir = "./test-output";
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Save dashboard
		const dashboardPath = path.join(outputDir, "dashboard.html");
		fs.writeFileSync(dashboardPath, dashboardHtml);
		console.log(`Dashboard saved to: ${dashboardPath}`);

		// Save mermaid diagram as HTML
		const mermaidHtmlPath = path.join(outputDir, "mermaid-diagram.html");
		const mermaidHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Story Structure - Mermaid Diagram</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .mermaid { background: white; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Story Structure - Mermaid Diagram</h1>
  <div class="mermaid">
${mermaidDiagram}
  </div>
</body>
</html>`;
		fs.writeFileSync(mermaidHtmlPath, mermaidHtml);
		console.log(`Mermaid diagram saved to: ${mermaidHtmlPath}`);

		// Save combined dashboard with mermaid
		const combinedPath = path.join(outputDir, "combined-dashboard.html");
		const combinedHtml =
			`<!DOCTYPE html>
<html>
<head>
  <title>Visual Story Planner - Combined Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .card { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
    .mermaid-container { background: white; padding: 20px; border-radius: 1rem; border: 1px solid #e2e8f0; margin: 20px 0; }
    .tab-buttons { display: flex; gap: 10px; margin-bottom: 20px; }
    .tab-button { padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .tab-button.active { background: #4f46e5; color: white; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold text-slate-900 mb-8">Visual Story Planner Dashboard</h1>
    
    <div class="tab-buttons">
      <button class="tab-button active" onclick="showTab('dashboard')">📊 Dashboard</button>
      <button class="tab-button" onclick="showTab('mermaid')">📈 Story Structure</button>
    </div>

    <div id="dashboard" class="tab-content active">
      ${dashboardHtml.substring(dashboardHtml.indexOf('<div class="max-w-6xl'), dashboardHtml.lastIndexOf("</div>") + 6)}
    </div>

    <div id="mermaid" class="tab-content">
      <div class="mermaid-container">
        <div class="mermaid">
${mermaidDiagram}
        </div>
      </div>
    </div>
  </div>

  <script>
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
      
      // Show selected tab
      document.getElementById(tabName).classList.add('active');
      document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`)?.classList.add('active');
      
      // Reinitialize mermaid if showing mermaid tab
      if (tabName === 'mermaid' && window.mermaid) {
        mermaid.contentLoaded();
      }
    }
  </script>
</body>
</html>`;
		fs.writeFileSync(combinedPath, combinedHtml);
		console.log(`Combined dashboard saved to: ${combinedPath}`);

		return {
			dashboardPath,
			mermaidHtmlPath,
			combinedPath,
			graph,
		};
	} catch (error) {
		console.error("Error generating dashboard:", error);
		throw error;
	}
}

// Run the generator
generateDashboard()
	.then((result) => {
		console.log("\n✅ Dashboard generation complete!");
		console.log("Generated files:");
		console.log(`  - Dashboard: ${result.dashboardPath}`);
		console.log(`  - Mermaid Diagram: ${result.mermaidHtmlPath}`);
		console.log(`  - Combined: ${result.combinedPath}`);
	})
	.catch((error) => {
		console.error("❌ Error:", error.message);
		process.exit(1);
	});
