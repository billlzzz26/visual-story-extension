#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ใช้ path.resolve เพื่อความชัวร์ว่า Path จะไม่ถูกเบี่ยงเบน
const repoRoot = path.resolve(__dirname, "../..");
const todoPath = path.resolve(repoRoot, "TODO.md");
const outPath = path.resolve(repoRoot, "docs", "completed-tasks.md");

function formatDate(date) {
	return date.toISOString().split("T")[0];
}

async function main() {
	// เช็กว่าไฟล์ต้นทางมีอยู่จริงไหมก่อนอ่าน
	try {
		await fs.access(todoPath);
	} catch {
		throw new Error(`Critical: TODO.md not found at ${todoPath}`);
	}

	const content = await fs.readFile(todoPath, "utf8");
	if (!content) return; // ถ้าไฟล์ว่างให้หยุดทำงานเงียบๆ

	const lines = content.split(/\r?\n/);
	const completedTasks = [];
	let currentSection = "General";

	for (const line of lines) {
		const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
		if (headingMatch) {
			currentSection = headingMatch[1].trim();
			continue;
		}

		const taskMatch = line.match(/^- \[x\]\s*(.*)$/);
		if (taskMatch) {
			completedTasks.push({
				section: currentSection,
				text: taskMatch[1].trim(),
			});
		}
	}

	const sections = completedTasks.reduce((map, task) => {
		if (!map[task.section]) {
			map[task.section] = [];
		}
		map[task.section].push(task.text);
		return map;
	}, {});

	const now = new Date();
	const dateStr = formatDate(now);

	const header = `---
title: Completed Tasks
description: Generated summary of completed TODO.md tasks
last_generated: ${dateStr}
---

`;

	let body = `# Completed Tasks\n\nGenerated from \`TODO.md\` on ${dateStr}.\n\n`;

	if (completedTasks.length === 0) {
		body += "No completed tasks were found in TODO.md.\n";
	} else {
		body += `Total completed tasks: ${completedTasks.length}\n\n`;
		for (const section of Object.keys(sections)) {
			body += `## ${section}\n\n`;
			for (const taskText of sections[section]) {
				body += `- [x] ${taskText}\n`;
			}
			body += "\n";
		}
	}

	// มั่นใจได้ว่าเขียนลงที่ docs/ เท่านั้น
	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await fs.writeFile(outPath, header + body, "utf8");

	console.log(`Success: Updated ${path.relative(repoRoot, outPath)}`);
}

// เปลี่ยนจาก process.exit เป็นการ throw เพื่อให้ CodeQL พอใจ
main().catch((error) => {
	console.error("Error updating docs:", error.message);
	throw error;
});
