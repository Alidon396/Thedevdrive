#!/usr/bin/env python3
"""
Update campaign URLs after deployment
Usage: python3 deploy_update.py https://your-deployed-url.com
"""

import json
import sys
from pathlib import Path

def update_campaign_urls(base_url):
    """Update all campaign files with production URL"""
    
    # Remove trailing slash
    base_url = base_url.rstrip('/')
    
    workspace = Path('workspace')
    
    print(f"\n🔄 Updating campaign files with: {base_url}\n")
    
    # Update deals.json
    with open(workspace / 'deals.json') as f:
        deals = json.load(f)
    
    for deal in deals['deals']:
        old_url = deal['demo_url']
        demo_path = old_url.split('demos/')[-1]
        deal['demo_url'] = f"{base_url}/demos/{demo_path}"
        print(f"  ✓ {deal['business_name']}: {deal['demo_url']}")
    
    with open(workspace / 'deals.json', 'w') as f:
        json.dump(deals, f, indent=2)

    # Update leads.json (if present)
    leads_file = workspace / 'leads.json'
    if leads_file.exists():
        with open(leads_file) as f:
            leads = json.load(f)

        updated = 0
        for lead in leads.get('leads', []):
            if 'demo_url' in lead and lead['demo_url']:
                old_url = lead['demo_url']
                demo_path = old_url.split('demos/')[-1]
                lead['demo_url'] = f"{base_url}/demos/{demo_path}"
                updated += 1
                print(f"  ✓ lead {lead.get('business_name','<unknown>')}: {lead['demo_url']}")

        with open(leads_file, 'w') as f:
            json.dump(leads, f, indent=2)

        print(f"\n✅ Leads file updated: {updated} entries changed")
    
    print("\n✅ Production URLs Updated!\n")
    print(f"📊 Summary:")
    print(f"   Base URL: {base_url}")
    print(f"   Deals Updated: {len(deals['deals'])}")
    print(f"   Pipeline Value: ${deals['summary']['pipeline_value']}")
    print(f"\n🚀 Ready to send campaign with production links!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("\n⚠️  Usage: python3 deploy_update.py [base_url]")
        print("\n📍 Example:")
        print("   python3 deploy_update.py https://thedevdrive-456.netlify.app")
        print("\n🔗 To deploy first:")
        print("   1. Go to https://app.netlify.com/drop")
        print("   2. Drag & drop project folder")
        print("   3. Get URL and run this script with that URL\n")
        sys.exit(1)
    
    base_url = sys.argv[1]
    update_campaign_urls(base_url)
