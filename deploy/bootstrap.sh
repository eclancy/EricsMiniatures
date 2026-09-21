#!/usr/bin/env bash
# One-time server setup for ericsminiatures.com.
#
# Run this ON THE SERVER, from a copy of this repo's deploy/ directory, before
# the first CI deploy. It is idempotent - re-running it is safe.
#
#   scp -r deploy user@host:~/
#   ssh user@host 'bash ~/deploy/bootstrap.sh'
#
# It does NOT copy the photos. Run deploy/sync-media.sh from your local
# checkout for that (it is ~1.7 GB, so it comes over rsync, not git).

set -euo pipefail

SITE_DIR="${SITE_DIR:-$HOME/ericsminiatures.com}"
CACHE_DIR="${CACHE_DIR:-/var/cache/ericsminiatures}"
SERVICE=ericsminiatures
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

say() { printf '\n==> %s\n' "$1"; }

say "Checking Node"
if ! command -v node >/dev/null 2>&1 || [ "$(node --version | sed 's/v\([0-9]*\).*/\1/')" -lt 18 ]; then
  echo "Node 18+ is required (sharp will not build without it). Installing Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "node $(node --version)"

say "Creating directories"
mkdir -p "$SITE_DIR"
sudo mkdir -p "$CACHE_DIR"
sudo chown "$USER" "$CACHE_DIR"
echo "  $SITE_DIR"
echo "  $CACHE_DIR (derivative cache, deliberately outside the deploy dir so deploys never wipe it)"

say "Writing server/.env"
# The systemd unit passes these to the service, but a CLI run of `npm run scan`
# or `npm run prewarm` inherits none of them and would fall back to the in-repo
# defaults - filling a cache directory the running service never reads. Both
# read this file, so they stay in agreement.
cat > "$SITE_DIR/server/.env" <<ENVEOF
MEDIA_ROOT=$SITE_DIR/media
CONTENT_ROOT=$SITE_DIR/content
CACHE_ROOT=$CACHE_DIR
CLIENT_ROOT=$SITE_DIR/build
SERVE_CLIENT=false
MAX_CONCURRENT_ENCODES=2
AVIF_EFFORT=4
ENVEOF
echo "  $SITE_DIR/server/.env"

say "Installing the systemd unit"
sed "s/REPLACE_ME_USER/$USER/g" "$here/$SERVICE.service" | sudo tee "/etc/systemd/system/$SERVICE.service" >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE"

say "Allowing CI to restart the service without a password"
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl restart $SERVICE, /bin/systemctl status $SERVICE, /bin/systemctl is-active $SERVICE" \
  | sudo tee "/etc/sudoers.d/$SERVICE" >/dev/null
sudo chmod 440 "/etc/sudoers.d/$SERVICE"

say "Configuring nginx"
if [ -f /etc/nginx/sites-enabled/ericsminiatures.com ] \
   && grep -q "proxy_pass http://127.0.0.1:4000" /etc/nginx/sites-enabled/ericsminiatures.com; then
  echo "already proxying to :4000, leaving it alone"
else
  if [ -f /etc/nginx/sites-available/ericsminiatures.com ]; then
    backup="/etc/nginx/sites-available/ericsminiatures.com.bak.$(date +%s)"
    sudo cp /etc/nginx/sites-available/ericsminiatures.com "$backup"
    echo "backed up the existing config to $backup"
    echo
    echo "  !! An nginx config for this site already exists."
    echo "  !! If certbot manages TLS for it, do NOT let this overwrite it."
    echo "  !! Merge the /media/ and /api/ location blocks from deploy/nginx.conf"
    echo "  !! into your existing server block instead, then re-run this script."
    echo
    read -r -p "  Overwrite it anyway? [y/N] " reply
    [ "$reply" = "y" ] || { echo "Leaving nginx alone. Finish the nginx step by hand."; exit 1; }
  fi
  sed "s/REPLACE_ME_USER/$USER/g" "$here/nginx.conf" | sudo tee /etc/nginx/sites-available/ericsminiatures.com >/dev/null
  sudo ln -sf /etc/nginx/sites-available/ericsminiatures.com /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
fi

say "Done"
cat <<NEXT
Remaining steps, in order:

  1. From your LOCAL checkout, copy the photos over (~1.7 GB, one time):
       HOST=$USER@$(hostname -f 2>/dev/null || echo your-host) ./deploy/sync-media.sh

  2. Back here, install the API and build the index:
       cd $SITE_DIR/server && npm ci --omit=dev && npm run scan

  3. Warm the cache. This is the slow one: 25-30 min on a 1 vCPU droplet, and
     only ever needs doing once. Run it in tmux/screen so an SSH drop is safe:
       cd $SITE_DIR/server && npm run prewarm

  4. Start it and check:
       sudo systemctl start $SERVICE
       curl -fsS http://127.0.0.1:4000/api/health

Once that health check returns ok, pushing to master will deploy.
NEXT
