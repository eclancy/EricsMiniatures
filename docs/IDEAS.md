# Ideas worth exploring

Things we have talked about but not built. Nothing here is committed to.

## Automatic cropping and image cleanup

The gallery grid renders every cover at 16:9 with `object-fit: cover`, which
crops from the centre. That is fine when the subject is centred and wrong when
it is not — a tall figure photographed with headroom gets its head cut off, and
a piece sitting low in frame loses its base.

The photos also vary a lot in framing, background and exposure, because they
were taken over several years in different places. A miniature on a white
sweep next to one shot on a dark desk next to one shot on a kitchen counter
makes the grid look busier than the work deserves.

Worth investigating, roughly in order of effort:

**Smart crop instead of centre crop.** sharp already ships
`.resize(w, h, { position: sharp.strategy.attention })`, which picks the crop
window by looking for the region of highest contrast and saturation. It is one
line in `imagePipeline.js` and would handle most off-centre subjects. The risk
is that it sometimes latches onto a bright background highlight rather than the
model, so it would need spot-checking across a sample before being turned on
for everything. `entropy` is the other built-in strategy and is usually more
conservative.

**Per-photo crop overrides.** Whatever the automatic choice, some photos will
need a human decision. A `crop` field in `content/projects.json` (a focal point,
or an explicit box) that the pipeline honours when present would let the
automatic path handle the bulk and leave an escape hatch. This pairs well with
the smart crop rather than competing with it.

**Background normalisation.** Several photos are of a piece on a plain
backdrop. Detecting that and flattening it to a consistent tone would make the
grid read as one set. This is the most invasive idea here — it edits the
photograph rather than framing it — so it would want an explicit opt-in per
project, and probably is not worth it unless the inconsistency actually bothers
you when looking at the live grid.

**Exposure and white balance evening-out.** Milder than the above and probably
higher value: a gentle auto-level so the set does not swing between "shot under
a window" and "shot under a desk lamp". sharp has `.normalise()`, which is
cheap to try. Same caveat — it should be reviewable, because auto-levelling a
deliberately dark, moody photo will ruin it.

**Cover selection.** Right now the cover is simply the lowest-numbered photo.
Some projects would be better represented by a different shot. That is already
solvable by hand — the cover could become a field in `projects.json` the same
way the section previews became explicit — and is probably worth doing before
any automatic image manipulation, because choosing a better photo beats
cropping a worse one.

A sensible first step would be generating a contact sheet of every cover as it
is cropped today (`server/scripts/make-contact-sheets.js` already does most of
this) and seeing how many actually look wrong. The answer might be "six of
them", in which case hand-picking beats building a pipeline.
