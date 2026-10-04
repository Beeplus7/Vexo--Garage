# Vexo Garage — VPS deploy + SSL prompt (paste in Terminal)

**Target:** `root@87.106.103.43` · Domain: `vexogarage.co.uk` · DNS A → `87.106.103.43` ✅

Run these on your **Mac** terminal (not inside `npm run dev:web`).

---

## 1) SSH into the VPS

```bash
ssh root@87.106.103.43
```

On first login, change the root password immediately:

```bash
passwd
```

---

## 2) Paste this full bootstrap (SSL + Node + Nginx + Certbot)

Copy everything below the line and paste into the SSH session:

```bash
set -euo pipefail

DOMAIN="vexogarage.co.uk"
APP_DIR="/var/www/vexo-garage"
REPO="https://github.com/Beeplus7/Vexo--Garage.git"

echo "==> Updating system"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Installing base packages"
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx ca-certificates gnupg

echo "==> Installing Node.js 20 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || true

echo "==> Clone / update repo"
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git fetch --all && git reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Create production .env (EDIT SECRETS AFTER)"
cat > "$APP_DIR/.env" <<'EOF'
DATABASE_URL=postgresql://postgres:REPLACE_DB_PASSWORD@db.vdtyzqzdakfckpcjxxpi.supabase.co:5432/postgres
SUPABASE_URL=https://vdtyzqzdakfckpcjxxpi.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://vdtyzqzdakfckpcjxxpi.supabase.co
SUPABASE_ANON_KEY=REPLACE_ANON_JWT
SUPABASE_SERVICE_ROLE_KEY=REPLACE_SERVICE_ROLE_JWT
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=REPLACE_PUBLISHABLE_OR_ANON
NEXT_PUBLIC_SITE_URL=https://vexogarage.co.uk
NEXT_PUBLIC_BASE_URL=https://vexogarage.co.uk
NEXT_PUBLIC_API_URL=https://api.vexogarage.co.uk
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=production
PORT=3000
EOF
cp "$APP_DIR/.env" "$APP_DIR/apps/web/.env.local"
chmod 600 "$APP_DIR/.env" "$APP_DIR/apps/web/.env.local"

echo "==> Install + build web"
npm install
npm run db:generate || true
npm run build:web

echo "==> systemd service for Next.js"
cat > /etc/systemd/system/vexo-web.service <<EOF
[Unit]
Description=Vexo Garage Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/apps/web
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vexo-web
systemctl restart vexo-web

echo "==> Nginx site for $DOMAIN + www + api"
cat > /etc/nginx/sites-available/vexo-garage <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

mkdir -p /var/www/certbot
ln -sf /etc/nginx/sites-available/vexo-garage /etc/nginx/sites-enabled/vexo-garage
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Let's Encrypt SSL for $DOMAIN"
certbot --nginx \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "api.$DOMAIN" \
  --non-interactive --agree-tos \
  --email admin@$DOMAIN \
  --redirect || certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN --redirect

echo "==> Status"
systemctl status vexo-web --no-pager -l | head -20
curl -I "http://127.0.0.1:3000" || true
echo "DONE — visit https://$DOMAIN"
```

---

## 3) After bootstrap — put real secrets on the VPS

```bash
nano /var/www/vexo-garage/.env
# paste real DATABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.
cp /var/www/vexo-garage/.env /var/www/vexo-garage/apps/web/.env.local
systemctl restart vexo-web
```

---

## 4) Optional DNS (if not already set)

| Host | Type | Value |
|------|------|-------|
| `@` / `vexogarage.co.uk` | A | `87.106.103.43` |
| `www` | A or CNAME | `87.106.103.43` or `vexogarage.co.uk` |
| `api` | A | `87.106.103.43` |

---

## 5) Verify SSL

```bash
curl -I https://vexogarage.co.uk
certbot certificates
```

---

## Notes

- If **Plesk** already owns ports 80/443, use Plesk → Domains → `vexogarage.co.uk` → SSL/TLS → Let's Encrypt instead of Certbot-nginx, and reverse-proxy to `127.0.0.1:3000`.
- Repo must contain the latest backend on `main` before clone (push from local if needed).
- Local `npm run dev:web` stays on your Mac; production runs on the VPS via systemd.
