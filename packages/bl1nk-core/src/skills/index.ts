/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * SkillManager — discovers, loads, validates, and caches skills
 * from multiple directory levels. Inspired by Qwen's skill-manager.ts.
 *
 * Skill Levels (precedence: project > user > extension > bundled):
 *   project   — `.qwen/skills/` in project root
 *   user      — `~/.qwen/skills/` in user home
 *   extension — skills from installed extensions
 *   bundled   — `skills/` shipped with the package
 */

import * as fsSync from "node:fs";
import { type FSWatcher, watch as watchFs } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
	type ListSkillsOptions,
	type SkillConfig,
	type SkillError,
	SkillError as SkillErrorClass,
	SkillErrorCode,
	type SkillLevel,
	type SkillValidationResult,
	parseSkillContent,
	validateSkillConfig,
} from "./types.js";

const SKILL_MANIFEST_FILE = "SKILL.md";
const SKILLS_CONFIG_DIR = "skills";
const QWEN_CONFIG_DIR = ".qwen";

export class SkillManager {
	private skillsCache: Map<SkillLevel, SkillConfig[]> | null = null;
	private readonly changeListeners: Set<() => void> = new Set();
	private readonly parseErrors: Map<string, SkillError> = new Map();
	private readonly watchers: Map<string, FSWatcher> = new Map();
	private watchStarted = false;
	private refreshTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly bundledSkillsDir: string;
	private readonly projectRoot: string;

	constructor(projectRoot?: string) {
		this.projectRoot = projectRoot ?? process.cwd();
		this.bundledSkillsDir = path.join(
			path.dirname(new URL(import.meta.url).pathname),
			"..",
			"skills",
		);
	}

	// ── Change Events ─────────────────────────────────────────────────

	addChangeListener(listener: () => void): () => void {
		this.changeListeners.add(listener);
		return () => {
			this.changeListeners.delete(listener);
		};
	}

	private notifyChangeListeners(): void {
		for (const listener of this.changeListeners) {
			try {
				listener();
			} catch {
				// Silently ignore listener errors
			}
		}
	}

	getParseErrors(): Map<string, SkillError> {
		return new Map(this.parseErrors);
	}

	// ── Public API ────────────────────────────────────────────────────

	async listSkills(options: ListSkillsOptions = {}): Promise<SkillConfig[]> {
		const skills: SkillConfig[] = [];
		const seenNames = new Set<string>();

		const levelsToCheck: SkillLevel[] = options.level
			? [options.level]
			: ["project", "user", "extension", "bundled"];

		const shouldUseCache = !options.force && this.skillsCache !== null;

		if (!shouldUseCache) {
			await this.refreshCache();
		}

		for (const level of levelsToCheck) {
			const levelSkills = this.skillsCache?.get(level) || [];
			for (const skill of levelSkills) {
				if (seenNames.has(skill.name)) continue;
				skills.push(skill);
				seenNames.add(skill.name);
			}
		}

		skills.sort((a, b) => a.name.localeCompare(b.name));
		return skills;
	}

	async loadSkill(
		name: string,
		level?: SkillLevel,
	): Promise<SkillConfig | null> {
		if (level) {
			return this.findSkillByNameAtLevel(name, level);
		}

		// Precedence: project > user > extension > bundled
		const levels: SkillLevel[] = ["project", "user", "extension", "bundled"];
		for (const lvl of levels) {
			const skill = await this.findSkillByNameAtLevel(name, lvl);
			if (skill) return skill;
		}
		return null;
	}

	validateConfig(config: Partial<SkillConfig>): SkillValidationResult {
		return validateSkillConfig(config);
	}

	async refreshCache(): Promise<void> {
		const skillsCache = new Map<SkillLevel, SkillConfig[]>();
		this.parseErrors.clear();

		const levels: SkillLevel[] = ["project", "user", "extension", "bundled"];
		let totalSkills = 0;

		for (const level of levels) {
			const levelSkills = await this.listSkillsAtLevel(level);
			skillsCache.set(level, levelSkills);
			totalSkills += levelSkills.length;
		}

		this.skillsCache = skillsCache;
		this.notifyChangeListeners();
	}

	// ── File Watchers ─────────────────────────────────────────────────

	async startWatching(): Promise<void> {
		if (this.watchStarted) return;
		this.watchStarted = true;
		await this.ensureUserSkillsDir();
		await this.refreshCache();
		this.updateWatchersFromCache();
	}

	stopWatching(): void {
		for (const watcher of this.watchers.values()) {
			void watcher.close().catch(() => {});
		}
		this.watchers.clear();
		this.watchStarted = false;
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
	}

	// ── Parsing ───────────────────────────────────────────────────────

	async parseSkillFile(
		filePath: string,
		level: SkillLevel,
	): Promise<SkillConfig> {
		try {
			const content = await fs.readFile(filePath, "utf8");
			return parseSkillContent(content, filePath, level);
		} catch (error) {
			const msg = error instanceof Error ? error.message : "Unknown error";
			const skillError = new SkillErrorClass(
				`Failed to read skill file: ${msg}`,
				SkillErrorCode.FILE_ERROR,
			);
			this.parseErrors.set(filePath, skillError);
			throw skillError;
		}
	}

	// ── Internal ──────────────────────────────────────────────────────

	private async findSkillByNameAtLevel(
		name: string,
		level: SkillLevel,
	): Promise<SkillConfig | null> {
		await this.ensureLevelCache(level);
		const levelSkills = this.skillsCache?.get(level) || [];
		return levelSkills.find((s) => s.name === name) ?? null;
	}

	private async ensureLevelCache(level: SkillLevel): Promise<void> {
		if (!this.skillsCache) {
			this.skillsCache = new Map<SkillLevel, SkillConfig[]>();
		}
		if (!this.skillsCache.has(level)) {
			const levelSkills = await this.listSkillsAtLevel(level);
			this.skillsCache.set(level, levelSkills);
		}
	}

	private async listSkillsAtLevel(level: SkillLevel): Promise<SkillConfig[]> {
		if (level === "extension") {
			// Extension skills are loaded via the extension system, not filesystem
			return [];
		}

		if (level === "bundled") {
			if (!fsSync.existsSync(this.bundledSkillsDir)) return [];
			return this.loadSkillsFromDir(this.bundledSkillsDir, "bundled");
		}

		const baseDirs = this.getSkillsBaseDirs(level);
		const skills: SkillConfig[] = [];
		const seenNames = new Set<string>();

		for (const baseDir of baseDirs) {
			const skillsFromDir = await this.loadSkillsFromDir(baseDir, level);
			for (const skill of skillsFromDir) {
				if (seenNames.has(skill.name)) continue;
				seenNames.add(skill.name);
				skills.push(skill);
			}
		}
		return skills;
	}

	private async loadSkillsFromDir(
		baseDir: string,
		level: SkillLevel,
	): Promise<SkillConfig[]> {
		try {
			const entries = await fs.readdir(baseDir, { withFileTypes: true });
			const skills: SkillConfig[] = [];

			for (const entry of entries) {
				if (!entry.isDirectory()) continue;

				const skillDir = path.join(baseDir, entry.name);
				const skillManifest = path.join(skillDir, SKILL_MANIFEST_FILE);

				try {
					await fs.access(skillManifest);
					const config = await this.parseSkillFile(skillManifest, level);
					skills.push(config);
				} catch {}
			}

			return skills;
		} catch {
			return [];
		}
	}

	private getSkillsBaseDirs(level: SkillLevel): string[] {
		switch (level) {
			case "project":
				return [
					path.join(this.projectRoot, QWEN_CONFIG_DIR, SKILLS_CONFIG_DIR),
				];
			case "user":
				return [
					path.join(
						process.env.HOME ?? process.env.USERPROFILE ?? "",
						QWEN_CONFIG_DIR,
						SKILLS_CONFIG_DIR,
					),
				];
			default:
				return [];
		}
	}

	private updateWatchersFromCache(): void {
		const watchTargets = new Set<string>(
			(["project", "user"] as const)
				.flatMap((level) => this.getSkillsBaseDirs(level))
				.filter((baseDir) => fsSync.existsSync(baseDir)),
		);

		// Remove stale watchers
		for (const [existingPath, watcher] of this.watchers) {
			if (!watchTargets.has(existingPath)) {
				void watcher.close().catch(() => {});
				this.watchers.delete(existingPath);
			}
		}

		// Add new watchers
		for (const watchPath of watchTargets) {
			if (this.watchers.has(watchPath)) continue;

			try {
				const watcher = watchFs(watchPath, { recursive: true });
				watcher.on("change", () => this.scheduleRefresh());
				watcher.on("error", () => {});
				this.watchers.set(watchPath, watcher);
			} catch {
				// Failed to watch directory — skip silently
			}
		}
	}

	private scheduleRefresh(): void {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = null;
			void this.refreshCache().then(() => this.updateWatchersFromCache());
		}, 150);
	}

	private async ensureUserSkillsDir(): Promise<void> {
		const homeDir = process.env.HOME ?? process.env.USERPROFILE ?? "";
		if (!homeDir) return;
		const baseDir = path.join(homeDir, QWEN_CONFIG_DIR, SKILLS_CONFIG_DIR);
		try {
			await fs.mkdir(baseDir, { recursive: true });
		} catch {
			// Failed to create directory — skip silently
		}
	}
}
