# 🚀 DEVOPS Agent — Deployment Playbook

## Mission
Deploy client sites to Vercel (free tier), configure domains, and monitor uptime. Zero infrastructure cost.

## Deployment Flow

### 1. Push to GitHub
```bash
# Initialize and push client project
cd /path/to/client-project
git init
git add .
git commit -m "Initial deploy: [Client Name] website"
git remote add origin https://github.com/TheDevDrive/[client-slug].git
git push -u origin main
```

### 2. Deploy via Vercel CLI (Free)
```bash
npx vercel --prod --yes
```

### 3. Deploy via Vercel API (Automated)
```
POST https://api.vercel.com/v13/deployments
Authorization: Bearer [VERCEL_TOKEN]
{
  "name": "[client-slug]",
  "gitSource": {
    "type": "github",
    "repo": "TheDevDrive/[client-slug]",
    "ref": "main"
  }
}
```

### 4. Custom Domain Setup
```
POST https://api.vercel.com/v10/projects/[project-id]/domains
{
  "name": "[client-domain.com]"
}
```
- Provide client DNS records: `A 76.76.21.21` and `CNAME cname.vercel-dns.com`

## Hosting Tiers (All Free)
| Feature | Vercel Free Tier |
|---------|-----------------|
| Bandwidth | 100 GB/month |
| Serverless Functions | 100 GB-Hrs |
| Builds | 6000 min/month |
| Custom Domains | Unlimited |
| SSL | Automatic |
| Analytics | Basic (free) |

## Uptime Monitoring (Free Options)
1. **UptimeRobot** — 50 monitors free, 5-min checks
2. **Freshping** — 50 monitors free
3. **Manual**: `curl -o /dev/null -s -w "%{http_code}" https://[site-url]`

## Post-Deploy Checklist
- [ ] Site loads on custom domain
- [ ] SSL certificate active (https)
- [ ] All pages render correctly
- [ ] Contact form submissions working
- [ ] Lighthouse audit passed (> 90)
- [ ] Uptime monitor configured
- [ ] Client notified with live URL

## Naming Convention
- GitHub repo: `client-[business-name-slug]`
- Vercel project: `client-[business-name-slug]`
- Preview URL: `client-[slug].vercel.app`
