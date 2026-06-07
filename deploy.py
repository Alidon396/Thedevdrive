#!/usr/bin/env python3
"""
TheDevDrive Deployment Manager
Prepares and deploys demo sites to GitHub Pages
"""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

class DeploymentManager:
    def __init__(self):
        self.root = Path('.')
        self.demos_dir = self.root / 'demos'
        self.config_file = self.root / 'workspace' / 'config.json'
        self.deployed_urls = {}
    
    def load_config(self):
        """Load config"""
        with open(self.config_file) as f:
            return json.load(f)
    
    def get_deployment_options(self):
        """Show deployment options"""
        print("\n" + "="*80)
        print("🚀 THEDEVDRIVE DEPLOYMENT OPTIONS")
        print("="*80 + "\n")
        
        options = {
            "1": {
                "name": "GitHub Pages (FREE)",
                "pros": "Free, no credit card, integrates with GitHub repo",
                "setup": "5 minutes",
                "domains": "username.github.io/Thedevdrive or custom domain",
                "url": "https://pages.github.com"
            },
            "2": {
                "name": "Netlify (FREE)",
                "pros": "Free, drag-drop deployment, auto-SSL",
                "setup": "3 minutes", 
                "domains": "thedevdrive.netlify.app or custom domain",
                "url": "https://netlify.com"
            },
            "3": {
                "name": "Vercel (Recommended - PENDING)",
                "pros": "Optimized for React, edge functions, serverless",
                "setup": "Requires API token",
                "domains": "thedevdrive.vercel.app or custom domain",
                "url": "https://vercel.com"
            },
            "4": {
                "name": "Railway (FREE - $5/month after)",
                "pros": "Docker support, async jobs, databases",
                "setup": "2 minutes",
                "domains": "Custom domain required",
                "url": "https://railway.app"
            },
            "5": {
                "name": "Local Network (TESTING)",
                "pros": "Works now, no setup, full control",
                "setup": "Already running",
                "domains": "http://[your-ip]:8000",
                "url": "Current"
            }
        }
        
        for key, opt in options.items():
            print(f"{key}. {opt['name']}")
            print(f"   ⏱️  Setup: {opt['setup']}")
            print(f"   📍 Domain: {opt['domains']}")
            print(f"   ✨ Pros: {opt['pros']}")
            print(f"   🔗 Learn: {opt['url']}\n")
        
        return options
    
    def generate_deployment_guide(self):
        """Generate GitHub Pages deployment guide"""
        guide = """
# 🚀 DEPLOYMENT GUIDE — GitHub Pages

## Step 1: Push Code to GitHub
Already done! Repository: https://github.com/Alidon396/Thedevdrive

## Step 2: Enable GitHub Pages
1. Go to https://github.com/Alidon396/Thedevdrive
2. Settings → Pages
3. Select "Deploy from a branch"
4. Branch: main | Folder: / (root)
5. Click Save

## Step 3: Wait for Build (2-3 minutes)
GitHub will automatically build and deploy

## Step 4: Access Your Sites
- **Dashboard**: https://alidon396.github.io/Thedevdrive/dashboard/
- **M Ashraf Mutton**: https://alidon396.github.io/Thedevdrive/demos/m-ashraf-mutton/
- **OraDent Clinic**: https://alidon396.github.io/Thedevdrive/demos/oradent-clinic/
- **MFIT Gym**: https://alidon396.github.io/Thedevdrive/demos/mfit-gym/
- **The Poet Restaurant**: https://alidon396.github.io/Thedevdrive/demos/the-poet-restaurant/
- **VelocityX Gym**: https://alidon396.github.io/Thedevdrive/demos/velocityx-gym/
- **Kensington Dental**: https://alidon396.github.io/Thedevdrive/demos/kensington-dental/

## Step 5: Use Production URLs
Update campaign files with production URLs instead of localhost

---

## 💡 RECOMMENDATION: Use Custom Domain (Optional)

1. Buy domain: namecheap.com ($0.99-15/year)
2. Point DNS to GitHub Pages
3. Set in Settings → Custom domain
4. Result: https://thedevdrive.com (or your domain)

---

## ⚡ FASTER ALTERNATIVE: Netlify (NO GitHub setup needed)

1. Go to https://app.netlify.com/drop
2. Drag & drop the 'demos' folder
3. Get instant URL: https://[random-id].netlify.app
4. Done in 30 seconds!

---

## CURRENT STATUS
- GitHub repo: ✅ Connected
- Files ready: ✅ All 6 demos
- GitHub Pages: ⏳ Ready to enable
- Production URLs: ⏳ Waiting for deployment
"""
        return guide
    
    def create_deployment_urls(self, platform="github-pages", username="alidon396"):
        """Generate production URLs"""
        base_urls = {
            "github-pages": f"https://{username}.github.io/Thedevdrive",
            "netlify": "https://thedevdrive.netlify.app",
            "vercel": "https://thedevdrive.vercel.app",
            "custom": "https://thedevdrive.com"
        }
        
        base = base_urls.get(platform, base_urls["github-pages"])
        
        demos = {
            "m-ashraf-mutton": f"{base}/demos/m-ashraf-mutton/index.html",
            "oradent-clinic": f"{base}/demos/oradent-clinic/index.html",
            "mfit-gym": f"{base}/demos/mfit-gym/index.html",
            "the-poet-restaurant": f"{base}/demos/the-poet-restaurant/index.html",
            "velocityx-gym": f"{base}/demos/velocityx-gym/index.html",
            "kensington-dental": f"{base}/demos/kensington-dental/index.html"
        }
        
        return demos
    
    def show_production_urls(self):
        """Display production URLs"""
        urls = self.create_deployment_urls()
        
        print("\n" + "="*80)
        print("🌍 PRODUCTION DEMO URLS — Ready to Use")
        print("="*80 + "\n")
        
        print("Once deployed to GitHub Pages, use these links in your campaign:\n")
        
        demos_map = {
            "m-ashraf-mutton": "M Ashraf Mutton Shop",
            "oradent-clinic": "OraDent Clinic",
            "mfit-gym": "MFIT Gym",
            "the-poet-restaurant": "The Poet Restaurant",
            "velocityx-gym": "VelocityX Gym",
            "kensington-dental": "Kensington Dental"
        }
        
        for key, name in demos_map.items():
            url = urls[key]
            print(f"🔗 {name}")
            print(f"   {url}\n")
        
        return urls
    
    def create_netlify_deployment_script(self):
        """Create Netlify deployment script"""
        script = """#!/bin/bash
# Deploy to Netlify (30-second deployment)

echo "🚀 Deploying to Netlify..."

# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.

# Get site URL
echo "✅ Deployment complete!"
echo "Your site is live at the URL shown above"
"""
        return script
    
    def show_quick_start(self):
        """Show quick start for deployment"""
        print("\n" + "="*80)
        print("⚡ QUICK START — Get Live in 30 Seconds (Netlify)")
        print("="*80 + "\n")
        
        print("""
1. Go to: https://app.netlify.com/drop

2. Drag & drop your project folder

3. Wait 10 seconds...

4. Get live URL: https://[random].netlify.app

5. Update campaign files with this URL

✅ Done! Share the URL with clients immediately.

---

ALTERNATIVE: If you prefer GitHub Pages (free, integrated):

1. Get your GitHub Pages URL from Settings → Pages
2. Copy the production URL (e.g., alidon396.github.io/Thedevdrive)
3. Update demo links in campaign files
4. Push changes to GitHub
5. Wait 2-3 minutes for build
6. Live! 🎉

""")

def main():
    manager = DeploymentManager()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--options':
            manager.get_deployment_options()
        elif sys.argv[1] == '--github-guide':
            print(manager.generate_deployment_guide())
        elif sys.argv[1] == '--urls':
            manager.show_production_urls()
        elif sys.argv[1] == '--quick':
            manager.show_quick_start()
    else:
        manager.show_quick_start()

if __name__ == '__main__':
    main()
