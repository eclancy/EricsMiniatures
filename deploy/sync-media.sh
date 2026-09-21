#!/usr/bin/env bash
# Sync the original photos to the server.
#
# media/ is ~1.7 GB and changes only when new projects are added, so it is kept
# out of the CI deploy. Run this from a checkout that has the media directory:
#
#   HOST=user@ericsminiatures.com ./deploy/sync-media.sh
#
# rsync transfers only what changed, so the first run is slow and later runs
# take seconds. After syncing, rebuild the index on the host:
#
#   ssh "$HOST" 'cd ~/ericsminiatures.com/server && npm run scan && npm run prewarm && sudo systemctl restart ericsminiatures'

set -euo pipefail

: "${HOST:?set HOST, e.g. HOST=user@ericsminiatures.com}"
REMOTE_DIR="${REMOTE_DIR:-~/ericsminiatures.com}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Syncing $repo_root/media -> $HOST:$REMOTE_DIR/media"
rsync -avh --progress --delete \
  --exclude '*.pdn' \
  "$repo_root/media/" \
  "$HOST:$REMOTE_DIR/media/"

echo
echo "Done. Now rebuild the index on the host:"
echo "  ssh $HOST 'cd $REMOTE_DIR/server && npm run scan && npm run prewarm && sudo systemctl restart ericsminiatures'"
