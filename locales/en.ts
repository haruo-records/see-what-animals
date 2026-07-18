export const en = {
  brand: "See What?",
  nav: {
    menu: "Menu",
    close: "Close",
    sound: "Sound",
    language: "Language",
  },
  home: {
    thisWeek: "This week's observation",
    observe: "Observe",
    play: "Play",
    begin: "Begin observation",
    enter: "Enter the observation",
    sections: {
      current: "Current observation",
      past: "Archive",
      about: "About the project",
      fieldNotes: "Field Notes",
      objects: "Objects & Paper Studies",
      shop: "Shop",
      archive: "animals archive",
      newsletter: "Newsletter",
    },
  },
  observe: {
    take: "Take a moment.",
    observe: "Observe",
    requiredHint: "An answer is needed to continue — or skip this one.",
    begin: "When you're ready",
    optional: "Optional",
    addNote: "Add a short observation",
    skip: "Skip",
    next: "Next",
    back: "Back",
    complete: "Complete observation",
    seeOthers: "See how others observed",
    closed: "This observation has closed.",
    already: "You've already observed this form.",
    viewResult: "See the record",
  },
  result: {
    youSaw: "You saw",
    othersSaw: "Others saw",
    someoneDiff: "Someone saw it differently.",
    responses: "responses",
    people: "people observed this form.",
    stillForming: "The record is still forming.",
    initial: "Initial observation",
    allTime: "All-time observation",
    names: "Names it was given",
    /** Shown when no name has been offered yet. Never a fabricated example. */
    noNames: "No names yet.",
    notes: "A few observations",
    /** Shown when no observer has left a note yet. */
    noNotes: "No observations yet.",
    archive: "View in animals archive",
    past: "Archive",
    /** Retained for a possible future return of Field Notes; unused in the UI. */
    fieldNotes: "Field Notes",
    noAnswer: "No answer is final.",
  },
  archive: {
    view: "View in animals archive",
    explore: "Explore the full archive",
    external: "opens the animals archive",
  },
  footer: {
    tagline: "A place to see before naming.",
    /** Retained for the type; no longer rendered — the footer is the mark and
        the archive link, nothing else. */
    rights: "All works remain in the animals archive.",
  },
};

export type Dictionary = typeof en;
