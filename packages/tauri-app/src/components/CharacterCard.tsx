"use client";

import { getRoleColor } from "../lib/colors";
import type { Character } from "../types/story";

interface CharacterCardProps {
	character: Character;
}

export function CharacterCard({
	character,
}: CharacterCardProps): React.ReactElement {
	const colors = getRoleColor(character.role);

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
			<div className="flex justify-between items-start mb-3">
				<h3 className="font-semibold text-slate-800">{character.name}</h3>
				<span
					className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors.bg} ${colors.text}`}
				>
					{character.role}
				</span>
			</div>

			<div className="mb-3">
				<p className="text-xs font-medium text-slate-500 mb-1">Traits</p>
				<div className="flex flex-wrap gap-1">
					{character.traits.slice(0, 4).map((trait) => (
						<span
							key={trait}
							className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
						>
							{trait}
						</span>
					))}
				</div>
			</div>

			<div>
				<p className="text-xs font-medium text-slate-500 mb-1">Arc</p>
				<p className="text-sm text-slate-600">{character.arc.start}</p>
				<p className="text-xs text-slate-400 mt-1">→ {character.arc.end}</p>
			</div>
		</div>
	);
}
