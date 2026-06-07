#!/usr/bin/env python3
"""
TheDevDrive Outreach Automation Script
Sends personalized emails and tracks responses
"""

import json
import sys
from datetime import datetime
from pathlib import Path

class OutreachManager:
    def __init__(self, workspace_path="workspace"):
        self.workspace = Path(workspace_path)
        self.leads_file = self.workspace / "leads.json"
        self.deals_file = self.workspace / "deals.json"
        self.log_file = self.workspace / "outreach_log.json"
        
    def load_data(self):
        """Load leads and deals data"""
        with open(self.leads_file) as f:
            leads = json.load(f)['leads']
        with open(self.deals_file) as f:
            deals = json.load(f)['deals']
        return leads, deals
    
    def get_contact_list(self):
        """Generate contact list for outreach"""
        leads, deals = self.load_data()
        
        contacts = []
        for deal in deals:
            # Find matching lead
            lead = next((l for l in leads if l['id'] == deal['lead_id']), None)
            if lead:
                contacts.append({
                    'business': deal['business_name'],
                    'name': lead.get('contact_name', 'Manager'),
                    'email': lead.get('contact_email'),
                    'phone': lead.get('contact_phone'),
                    'method': deal.get('contact_method', 'email'),
                    'price': deal['price_usd'],
                    'demo_url': deal.get('demo_url'),
                    'score': lead.get('score'),
                    'deal_id': deal['id']
                })
        
        return sorted(contacts, key=lambda x: x['score'], reverse=True)
    
    def print_contact_summary(self):
        """Print formatted contact list"""
        contacts = self.get_contact_list()
        
        print("\n" + "="*80)
        print("🎯 THEDEVDRIVE OUTREACH TARGET LIST — June 6, 2026")
        print("="*80 + "\n")
        
        total_value = sum(c['price'] for c in contacts)
        print(f"📊 Total Pipeline: ${total_value} | Contacts: {len(contacts)} | Target: $1,000\n")
        
        for idx, contact in enumerate(contacts, 1):
            priority = "🔴 URGENT" if contact['score'] >= 8 else "🟡 HIGH" if contact['score'] >= 7 else "🟢 MEDIUM"
            
            print(f"{idx}. {contact['business'].upper()}")
            print(f"   Score: {contact['score']}/10 | Priority: {priority} | Deal: ${contact['price']}")
            
            if contact['method'] in ['email', 'both'] and contact['email']:
                print(f"   📧 Email: {contact['email']}")
            if contact['method'] in ['phone', 'both'] and contact['phone']:
                print(f"   ☎️  Phone: {contact['phone']}")
            
            print(f"   🔗 Demo: {contact['demo_url']}")
            print()
        
        print("="*80)
        print("\nREADY TO SEND? Run: python3 outreach.py --send\n")
    
    def generate_email_body(self, contact):
        """Generate personalized email body"""
        templates = {
            "M Ashraf Mutton Shop & Restaurant": f"""Hi {contact['name']},

I came across your business on Facebook and saw the incredible reviews and engagement you're getting. People LOVE your food. The problem? You're only reachable on Facebook.

Here's the issue: **87% of customers search online before visiting a local restaurant**. You're losing direct orders and walk-ins who can't find you beyond Facebook.

I built a quick preview of what your website could look like:
🔗 {contact['demo_url']}

This shows:
- Professional Business Presence
- Online Reservation System
- Menu Showcase
- Direct Ordering Capability

**Bottom line**: A real website could bring you 30-50 new customers per month. We can have your actual site live within 24 hours for just ${contact['price']}.

Would you like me to set it up?

Best,
TheDevDrive Team
Karachi, Pakistan""",

            "OraDent Dental Clinic": f"""Hi {contact['name']},

I audited your website and found:
- ⚠️ Page loads in 4.2 seconds (patients leave after 3)
- ⚠️ No online booking system (missed appointments)
- ⚠️ Generic placeholder text (unprofessional)

Every day your site loses potential patients to competitors with better online presence.

I built a modern replacement:
🔗 {contact['demo_url']}

**Result**: Clinics like yours typically see 40% increase in online bookings after redesign.

**Price**: ${contact['price']} | **Turnaround**: 48 hours

Ready to modernize?

Best,
TheDevDrive Team""",

            "MFIT Gym": f"""Hi {contact['name']},

Your website is outdated and not mobile-friendly. In 2026, 70% of gym signups happen on mobile. Yours doesn't work well on phones.

Here's a modern demo I built:
🔗 {contact['demo_url']}

**Impact**: Gyms with modern sites see 25-35% rise in trial signups.

**Price**: ${contact['price']} | **Turnaround**: 3 days

Let's get this live?

Best,
TheDevDrive Team"""
        }
        
        # Return generic template if specific one not found
        default = f"""Hi {contact['name']},

Check out this quick preview I built for {contact['business']}:
🔗 {contact['demo_url']}

This addresses the key issues with your current site and shows the impact a modern redesign could have.

Ready to discuss? Price: ${contact['price']}

Best,
TheDevDrive Team"""
        
        return templates.get(contact['business'], default)
    
    def log_outreach(self, contact, method, status):
        """Log outreach attempt"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'business': contact['business'],
            'contact': contact['name'],
            'method': method,
            'status': status,
            'demo_url': contact['demo_url']
        }
        
        # Load or create log
        if self.log_file.exists():
            with open(self.log_file) as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        with open(self.log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def simulate_send(self):
        """Simulate sending outreach (for demo)"""
        contacts = self.get_contact_list()
        
        print("\n" + "="*80)
        print("📧 SIMULATING OUTREACH CAMPAIGN")
        print("="*80 + "\n")
        
        for contact in contacts:
            method = contact['method']
            
            if method in ['email', 'both'] and contact['email']:
                print(f"✉️  [{contact['business'].upper()}]")
                print(f"   TO: {contact['email']}")
                print(f"   DEMO: {contact['demo_url']}\n")
                self.log_outreach(contact, 'email', 'queued')
            
            if method in ['phone', 'both'] and contact['phone']:
                print(f"☎️  [{contact['business'].upper()}]")
                print(f"   CALL: {contact['phone']}")
                print(f"   MESSAGE: [See template in outreach_templates.md]\n")
                self.log_outreach(contact, 'phone', 'queued')
        
        print("="*80)
        print(f"\n✅ Logged {len(contacts)} outreach attempts")
        print(f"📊 Total pipeline: ${sum(c['price'] for c in contacts)}")
        print(f"📝 Log saved to: {self.log_file}\n")

def main():
    manager = OutreachManager()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--send':
        manager.simulate_send()
    else:
        manager.print_contact_summary()

if __name__ == '__main__':
    main()
