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

import { bodyPod } from "../modules/bodies/pod";
import { bodyStack } from "../modules/bodies/stack";
import { bodyBend } from "../modules/bodies/bend";
import { bodyArch } from "../modules/bodies/arch";
import { bodyRoll } from "../modules/bodies/roll";

import { auxStub } from "../modules/appendages/stub";
import { auxRing } from "../modules/appendages/ring";
import { auxTab } from "../modules/appendages/tab";
import { auxPip } from "../modules/appendages/pip";

import { patternBands } from "../modules/patterns/bands";
import { patternPorts } from "../modules/patterns/ports";
import { patternCoil } from "../modules/patterns/coil";

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

import { paletteInk, paletteGraphite } from "../modules/palettes/ink";

/**
 * THE REGISTRY — the one file that knows every module exists.
 *
 * v2 of the form language: a work is a small number of solid ink masses with
 * paper-coloured seams, standing a little wrong, with at most a few small
 * auxiliary parts. Bodies compose 2–5 planes themselves; appendages became
 * auxiliary forms (stub, ring, tab, pip); patterns draw in paper colour so
 * they exist only where they cross ink.
 *
 * Explicit imports, not a directory scan — the module set must depend on the
 * commit, not on what happens to be on disk.
 */

export const bodies: BodyModule[] = [bodyPod, bodyStack, bodyBend, bodyArch, bodyRoll];

export const appendages: AppendageModule[] = [auxStub, auxRing, auxTab, auxPip];

export const patterns: PatternModule[] = [patternBands, patternPorts, patternCoil];

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
