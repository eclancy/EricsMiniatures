'use strict';

// Known acronyms / stylizations that the generic camelCase splitter would mangle.
const ACRONYMS = { uss: 'USS', trex: 'T-Rex', ww: 'WW' };

/**
 * Split a CamelCase / mixed identifier into words.
 * "DisplacerBeastMutilated" -> ["Displacer","Beast","Mutilated"]
 * "USSCongress"             -> ["USS","Congress"]
 * "legoFlowers"             -> ["lego","Flowers"]
 * "Clockwork Dragon"        -> ["Clockwork","Dragon"]
 */
function splitWords(name) {
  return String(name)
    .replace(/^\d+/, '') // leading ordering digits ("0Blimpy")
    .replace(/[_\-\s]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2') // lower|digit -> Upper boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // acronym run -> Word boundary
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** URL-safe lowercase slug: "1DisplacerBeastMutilated" -> "displacer-beast-mutilated" */
function slugify(name) {
  return splitWords(name)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/** Human title: "1DisplacerBeastMutilated" -> "Displacer Beast Mutilated" */
function titleize(name) {
  return splitWords(name)
    .map((word) => {
      const key = word.toLowerCase();
      if (ACRONYMS[key]) return ACRONYMS[key];
      if (word === word.toUpperCase() && word.length > 1) return word; // keep existing acronyms
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * The ordering number folded into a filename ("Temple99.jpg" -> 99).
 * Files with no trailing number sort last but keep a stable relative order.
 */
function orderOf(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const match = base.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

/** "0Blimpy" + "0Blimpy2.jpg" -> "blimpy-2.jpg" */
function mediaFilename(projectSlug, filename) {
  const ext = (filename.match(/\.[^.]+$/) || [''])[0].toLowerCase();
  const base = filename.slice(0, filename.length - ext.length);
  const order = orderOf(filename);
  const suffix = order === Number.MAX_SAFE_INTEGER ? slugify(base) : String(order);
  // Drop the redundant project name baked into most filenames.
  const projectWords = projectSlug.split('-');
  const suffixWords = suffix.split('-').filter((w) => w && !projectWords.includes(w));
  const tail = suffixWords.length ? suffixWords.join('-') : String(order === Number.MAX_SAFE_INTEGER ? 1 : order);
  return `${projectSlug}-${tail}${ext}`;
}

module.exports = { splitWords, slugify, titleize, orderOf, mediaFilename, ACRONYMS };
