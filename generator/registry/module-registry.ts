import type {
  AppendageModule,
  ArrangementModule,
  BodyModule,
  ModuleCategory,
  MotionModule,
  PaletteModule,
  PatternModule,
  TransformationModule,
  VisualModule,
} from "./module-types";

import { bodyWeightedArc } from "../modules/bodies/weighted-arc";
import { bodyFork } from "../modules/bodies/fork";
import { bodyOpenShell } from "../modules/bodies/open-shell";
import { bodySuspendedMass } from "../modules/bodies/suspended-mass";
import { bodySplitColumn } from "../modules/bodies/split-column";
import { bodyCoiledSupport } from "../modules/bodies/coiled-support";
import { bodyHingedMass } from "../modules/bodies/hinged-mass";
import { bodyCrookedFrame } from "../modules/bodies/crooked-frame";
import { bodyDriftingPlate } from "../modules/bodies/drifting-plate";

import { growthBud } from "../modules/appendages/bud";
import { growthTendril } from "../modules/appendages/tendril";

import { patternSegments } from "../modules/patterns/segments";
import { patternSeam } from "../modules/patterns/seam";

import { arrangementAlongBody } from "../modules/arrangements/along-body";
import { arrangementAtExtremity } from "../modules/arrangements/at-extremity";
import { arrangementOnSecondary } from "../modules/arrangements/on-secondary";

import { deformLean } from "../modules/transformations/lean";
import { deformMassShift } from "../modules/transformations/mass-shift";
import { deformKink } from "../modules/transformations/kink";
import { deformStretch } from "../modules/transformations/stretch";
import { deformCurlIn } from "../modules/transformations/curl-in";
import { deformPinch } from "../modules/transformations/pinch";

import { motionRotate } from "../modules/motions/rotate";
import { motionPulse } from "../modules/motions/pulse";
import { motionFold } from "../modules/motions/fold";
import { motionInternalShift } from "../modules/motions/internal-shift";
import { motionSway } from "../modules/motions/sway";

import { paletteInk, paletteGraphite } from "../modules/palettes/ink";

/**
 * THE REGISTRY — the one file that knows every module exists.
 *
 * Form-language v4. A body is one or more SPINES: paths carrying a radius at
 * every point, closed into filled outlines. Thickness varies along the length,
 * so a body can taper, fork, swell and pinch, and a heavy mass can hang from a
 * neck too thin for it.
 *
 * The two languages before this both failed for the same underlying reason —
 * their alphabet had one letter. v1 drew thin lines; v3 drew rounded rectangles.
 * Everything made of rounded rectangles is a capsule, and capsules near each
 * other are a logo.
 *
 * Nine bodies, so a batch of nine or fewer never repeats a silhouette.
 */

export const bodies: BodyModule[] = [
  bodyWeightedArc,
  bodyFork,
  bodyOpenShell,
  bodySuspendedMass,
  bodySplitColumn,
  bodyCoiledSupport,
  bodyHingedMass,
  bodyCrookedFrame,
  bodyDriftingPlate,
];

export const appendages: AppendageModule[] = [growthBud, growthTendril];

export const patterns: PatternModule[] = [patternSegments, patternSeam];

export const arrangements: ArrangementModule[] = [
  arrangementAlongBody,
  arrangementAtExtremity,
  arrangementOnSecondary,
];

export const transformations: TransformationModule[] = [
  deformLean,
  deformMassShift,
  deformKink,
  deformStretch,
  deformCurlIn,
  deformPinch,
];

export const motions: MotionModule[] = [
  motionRotate,
  motionPulse,
  motionFold,
  motionInternalShift,
  motionSway,
];

export const palettes: PaletteModule[] = [paletteInk, paletteGraphite];

export const allModules: VisualModule[] = [
  ...bodies,
  ...appendages,
  ...patterns,
  ...arrangements,
  ...transformations,
  ...motions,
  ...palettes,
];

const byId = new Map<string, VisualModule>();
for (const m of allModules) byId.set(m.id, m);

export function getModule(id: string): VisualModule | undefined {
  return byId.get(id);
}

export function getModulesByCategory(category: ModuleCategory): VisualModule[] {
  return allModules.filter((m) => m.category === category);
}

/** Only modules a generation run may draw from. `enabled: false` is a hard stop. */
export function enabledOf<T extends VisualModule>(list: T[]): T[] {
  return list.filter((m) => m.enabled);
}

export const registryStats = () => ({
  total: allModules.length,
  enabled: allModules.filter((m) => m.enabled).length,
  byCategory: {
    body: bodies.length,
    appendage: appendages.length,
    pattern: patterns.length,
    arrangement: arrangements.length,
    transformation: transformations.length,
    motion: motions.length,
    palette: palettes.length,
  },
});
