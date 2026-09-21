# Server setup

**Do this before the first push.** The deploy workflow now refuses to copy
anything to a host that is not ready — the client bundle expects `/api` and
`/media` to exist, so shipping it to an unprepared server would leave the site
broken. The Preflight step checks for Node 18+, the photos, the systemd unit,
a writable cache directory, passwordless `systemctl restart`, and an nginx
config that proxies to port 4000 (following symlinks, since sites-enabled
holds them), and fails the run before touching the live
files if any are missing.

## The quick path

```bash
scp -r deploy user@your-droplet:~/
ssh user@your-droplet 'bash ~/deploy/bootstrap.sh'
```

`bootstrap.sh` handles Node, the directories, the systemd unit, the sudoers
rule and nginx, and then prints the remaining commands. It is idempotent, and
it will not silently overwrite an existing nginx config for this site.

Then sync the photos and warm the cache (steps 3 and 4 below), and you are done.

The rest of this file is what bootstrap.sh does, in case you would rather do it
by hand or need to debug it.

## 1. Node

The API needs Node 18 or newer (sharp requires it).

```bash
node --version   # if this is older than 18, install a newer one
```

## 2. Directories

```bash
# The deploy user's copy of the site. CI writes build/, server/ and content/.
mkdir -p ~/ericsminiatures.com

# The derivative cache lives outside the deploy directory so a deploy never
# wipes it.
sudo mkdir -p /var/cache/ericsminiatures
sudo chown "$USER" /var/cache/ericsminiatures
```

## 3. Photos

`media/` is ~1.7 GB and is deliberately excluded from CI. Sync it once from a
local checkout:

```bash
HOST=user@ericsminiatures.com ./deploy/sync-media.sh
```

Re-run it whenever you add new project photos; rsync only sends what changed.

## 4. The service

```bash
sed "s/REPLACE_ME_USER/$USER/g" deploy/ericsminiatures.service \
  | sudo tee /etc/systemd/system/ericsminiatures.service

cd ~/ericsminiatures.com/server
npm ci --omit=dev
npm run scan       # build content/media-index.json from the synced photos
npm run prewarm    # generate the derivatives visitors hit first

sudo systemctl daemon-reload
sudo systemctl enable --now ericsminiatures
curl -fsS http://127.0.0.1:4000/api/health
```

## 5. nginx

```bash
sed "s/REPLACE_ME_USER/$USER/g" deploy/nginx.conf \
  | sudo tee /etc/nginx/sites-available/ericsminiatures.com
sudo ln -sf /etc/nginx/sites-available/ericsminiatures.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

If certbot already manages TLS for this domain, merge the `location` blocks from
`deploy/nginx.conf` into the existing server block rather than replacing it, so
the certificate configuration is preserved.

## 6. Passwordless restart for CI

The deploy workflow runs `sudo systemctl restart ericsminiatures`. Allow just
that command without a password:

```bash
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl restart ericsminiatures" \
  | sudo tee /etc/sudoers.d/ericsminiatures
sudo chmod 440 /etc/sudoers.d/ericsminiatures
```

## GitHub secrets

The workflow uses the same secrets as before — `HOST`, `USERNAME`, `KEY`,
`PASSPHRASE` — for both the file copy and the restart step.

## Checks

```bash
systemctl status ericsminiatures
journalctl -u ericsminiatures -f
curl -fsS https://ericsminiatures.com/api/health

# Confirm images are being negotiated and cached:
curl -sI 'https://ericsminiatures.com/media/miniatures/big-kraken/big-kraken-1.jpg?w=960' \
  -H 'Accept: image/avif,image/webp,*/*' | grep -i 'content-type\|x-image-cache'
```

`X-Image-Cache: HIT` means the derivative was served from disk. A `MISS` on
every request means `CACHE_ROOT` is not writable.

---

# DigitalOcean notes

## Droplet, not App Platform

This needs a **Droplet** (or any VPS with persistent disk and SSH). App Platform
is a poor fit here for two reasons: its filesystem is ephemeral, so the
derivative cache would be discarded on every deploy and restart, and the 1.7 GB
of original photos cannot practically live in a build image. Running on App
Platform would mean moving the originals to Spaces and rewriting the media route
to read from object storage.

## Sizing

Measured on the actual photo set (median source 12 MP, largest 24 MP):

| | single-threaded cost |
| --- | --- |
| AVIF at 960 px | ~1.1 s |
| AVIF at 1600 px | ~2.2–3.4 s |
| WebP at 960 px | ~0.12 s |
| JPEG at 960 px | ~0.11 s |
| peak memory per encode | ~160 MB |

With `MAX_CONCURRENT_ENCODES=2`, 24 simultaneous cold requests for distinct
24 MP photos peaked at **212 MB** resident — the semaphore queues the rest
rather than letting each one allocate its own bitmap.

**The Basic 1 vCPU / 1 GB droplet is sufficient.** On the 512 MB size, set
`MAX_CONCURRENT_ENCODES=1`. Those costs are only paid on a cache miss; after the
prewarm step, visitors are served from disk.

Disk: ~1.7 GB originals + ~55 MB cache + ~200 MB `node_modules`. The 25 GB
included with the smallest droplet is plenty.

## Requirements

- **Ubuntu 22.04 or 24.04.** sharp ships prebuilt binaries that need glibc 2.28+;
  on older images it falls back to compiling libvips from source.
- **Node 18 or newer.** DigitalOcean's default Ubuntu images ship an older Node,
  so install a current one first:

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  node --version
  ```

## First deploy is the slow one

`npm run prewarm` generates ~2000 derivatives. On 1 vCPU that is roughly
**25–30 minutes**, and it is the only time you pay it: the cache lives in
`/var/cache/ericsminiatures`, outside the deploy directory, so later deploys
find everything already built and the step finishes in seconds. Only photos you
actually add or change get re-encoded.

Run the first prewarm manually over SSH rather than letting CI do it, so a slow
first run does not look like a hung workflow:

```bash
cd ~/ericsminiatures.com/server && npm run prewarm
```

## Firewall

Only 80 and 443 need to be open. The API listens on 4000 for nginx on localhost;
do not expose it:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

If you use a DigitalOcean cloud firewall, the same applies — 4000 stays closed.

## Bandwidth

Droplet plans include 1–2 TB of transfer. At roughly 250 KB per gallery page
instead of 20–30 MB, that is no longer a number worth worrying about; before
this change, ~60 visitors browsing four pages each could have exhausted a 1 TB
allowance.
