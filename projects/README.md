# Web Server Projects Directory

## ⚠️ IMPORTANT: DO NOT EDIT FILES HERE

**All files in this directory are SYMLINKS to the workspace.**

### Where to Edit Files:
- **Corporate Cinema (Production):** `/home/openclaw/.openclaw/workspace/projects/corporate-cinema/frontend/`
- **Corporate Cinema (Development):** `/home/openclaw/.openclaw/workspace/projects/corporate-cinema-dev/frontend/`

### How It Works:
1. **Single Source of Truth:** Files are edited in the workspace
2. **Automatic Deployment:** Symlinks point from here to the workspace
3. **No Duplication:** Changes are visible immediately on the website

### Deployment Script:
```bash
# Sync workspace to web server (if needed for backups)
/home/openclaw/.openclaw/workspace/scripts/deploy-websites.sh
```

### Permissions:
- Web server (Caddy) can read files via symlinks
- Workspace files are the only editable copies
- Never edit files directly in `/var/www/projects/`