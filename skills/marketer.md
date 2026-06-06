# 🎯 MARKETER Agent — Lead Scraping Playbook

## Mission
Find businesses with bad/no websites, scrape their info, score them, and feed them into the sales pipeline.

## Target Industries (High ROI, Fast Close)
1. **Restaurants & Cafés** — Often have outdated or no websites
2. **Real Estate Agents** — Need professional landing pages
3. **Local Services** (plumbers, electricians, salons) — Rarely have good web presence
4. **Fitness / Gyms** — Need booking pages
5. **Clinics / Dentists** — Need modern, trust-building sites

## Lead Sourcing Methods

### 1. Google Maps Scraping
- Search: `[industry] in [city]` on Google Maps
- Collect: name, phone, website, rating, review count
- Flag businesses with no website or sites that look outdated

### 2. Firecrawl (if API key available)
```
POST https://api.firecrawl.dev/v1/scrape
{
  "url": "https://target-business.com",
  "formats": ["markdown"]
}
```
- Analyze scraped content for: broken links, no mobile responsiveness, outdated design, missing SSL, slow load times

### 3. Jina Reader (free, no API key needed)
```
GET https://r.jina.ai/https://target-business.com
```
- Quick content extraction to assess site quality

## Lead Scoring (1-10)
| Score | Criteria |
|-------|----------|
| 9-10  | No website at all + high Google rating |
| 7-8   | Has website but very outdated / broken |
| 5-6   | Decent site but missing key features |
| 3-4   | Good site, minor improvements possible |
| 1-2   | Modern site, not a good lead |

## Output Format
Add leads to `/workspace/leads.json` with all fields populated.

## Daily Target
- **Minimum 20 leads scraped per day**
- **Minimum 10 scored 7+** (high priority)
