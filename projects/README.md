# Web Server Projects Directory

## ⚠️ IMPORTANT: DO NOT EDIT FILES HERE

**All files in this directory are SYMLINKS to the workspace.**

### Where to Edit Files:
- **Corporate Cinema (Production):** `/home/openclaw/.openclaw/workspace/projects/corporate-cinema/frontend/`
- **Corporate Cinema (Development):** `/home/openclaw/.openclaw/workspace/projects/corporate-cinema-dev/frontend/`

### How It Works:
1. **Single Point of Truth (SPOT):** Files are edited only in the workspace.
2. **Instant Deployment:** Any change saved in the workspace is immediately live on the website.
3. **No Duplication:** We avoid redundant copies of large frontend assets.

### Troubleshooting:
If Caddy returns a 403, ensure the `caddy` user has traversal permissions (`r-x`) on the path:
```bash
sudo setfacl -m m:r-x /home/openclaw/.openclaw
sudo setfacl -m u:caddy:r-x /home/openclaw/.openclaw
```

### Permissions:
- Web server (Caddy) can read files directly via these symlinks.
- Workspace files are the only editable copies; never edit files directly in `/var/www/projects/`.