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

import { bodyOval } from "../modules/bodies/oval";
import { bodyRibbon } from "../modules/bodies/ribbon";
import { bodyCluster } from "../modules/bodies/cluster";
import { bodyRing } from "../modules/bodies/ring";
import { bodySegmented } from "../modules/bodies/segmented";

import { appendageThinLine } from "../modules/appendages/thin-line";
import { appendageLoop } from "../modules/appendages/loop";
import { appendageBranch } from "../modules/appendages/branch";
import { appendagePlate } from "../modules/appendages/plate";
import { appendageSoftSpike } from "../modules/appendages/soft-spike";
import { appendageShortBar } from "../modules/appendages/short-bar";

import { patternDots } from "../modules/patterns/dots";
import { patternRings } from "../modules/patterns/rings";
import { patternStripes } from "../modules/patterns/stripes";
import { patternRepeatedLines } from "../modules/patterns/repeated-lines";

import { arrangementRadial } from "../modules/arrangements/radial";
import { arrangementLinear } from "../modules/arrangements/linear";
import { arrangementNested } from "../modules/arrangements/nested";
import { arrangementAsymmetric } from "../modules/arrangements/asymmetric";
import { arrangementAlmostSymmetrical } from "../modules/arrangements/almost-symmetrical";

import { transformationMissingPart } from "../modules/transformations/missing-part";
import { transformationOffset } from "../modules/transformations/offset";
import { transformationUnevenScale } from "../modules/transformations/uneven-scale";
import { transformationPartialRotation } from "../modules/transformations/partial-rotation";
import { transformationOverlap } from "../modules/transformations/overlap";
import { transformationAsymmetricGap } from "../modules/transformations/asymmetric-gap";

import { motionRotate } from "../modules/motions/rotate";
import { motionPulse } from "../modules/motions/pulse";
import { motionFold } from "../modules/motions/fold";
import { motionInternalShift } from "../modules/motions/internal-shift";
import { motionSway } from "../modules/motions/sway";

import { paletteInk, paletteFaint, paletteSlate } from "../modules/palettes/ink";

/**
 * THE REGISTRY — the one file that knows every module exists.
 *
 * Explicit imports, not a directory scan. Dynamic import would make the module
 * set depend on the filesystem at run time, which breaks bundling and makes the
 * output of a given seed depend on what happens to be on disk. A generator
 * whose results cannot be reproduced from a commit is not much use.
 *
 * Adding a module means adding two lines here. `generator:module-create` writes
 * the module file and tells you exactly what to paste.
 *
 * Nothing else in the generator imports a module directly — engine, rules and
 * renderer all go through these lookups.
 */

export const bodies: BodyModule[] = [
  bodyOval,
  bodyRibbon,
  bodyCluster,
  bodyRing,
  bodySegmented,
];

export const appendages: AppendageModule[] = [
  appendageThinLine,
  appendageLoop,
  appendageBranch,
  appendagePlate,
  appendageSoftSpike,
  appendageShortBar,
];

export const patterns: PatternModule[] = [
  patternDots,
  patternRings,
  patternStripes,
  patternRepeatedLines,
];

export const arrangements: ArrangementModule[] = [
  arrangementRadial,
  arrangementLinear,
  arrangementNested,
  arrangementAsymmetric,
  arrangementAlmostSymmetrical,
];

export const transformations: TransformationModule[] = [
  transformationMissingPart,
  transformationOffset,
  transformationUnevenScale,
  transformationPartialRotation,
  transformationOverlap,
  transformationAsymmetricGap,
];

export const motions: MotionModule[] = [
  motionRotate,
  motionPulse,
  motionFold,
  motionInternalShift,
  motionSway,
];

export const palettes: PaletteModule[] = [paletteInk, paletteFaint, paletteSlate];

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
