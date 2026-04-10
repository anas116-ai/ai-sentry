import requests
import json

# Credentials
SUPABASE_URL = "https://xxjwbrzdfthorfdvzltt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4andicnpkZnRob3JmZHZ6bHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjA2MzIsImV4cCI6MjA5MTAzNjYzMn0.8Wzh6kLKhFGKR4RjagAq5izfFXrISZ734_TzoeawIgU"

def sync_to_supabase(tools):
    api_url = f"{SUPABASE_URL}/rest/v1/tools"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    count = 0
    for tool in tools:
        try:
            res = requests.post(api_url, headers=headers, data=json.dumps(tool))
            if res.status_code in [200, 201]:
                count += 1
        except:
            pass
    print(f"✅ Successfully synced {count} new tools to AI-Sentry!")

def scrape_futurepedia_api():
    print("🤖 AI-Sentry Bot: Scanning Futurepedia for New Releases...")
    # Futurepedia internal data endpoint
    url = "https://www.futurepedia.io/api/tools?sort=new"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        # XML kakunda JSON data try chesthunnam
        data = response.json() 
        
        new_tools = []
        # JSON structure batti data extract chestham
        for tool in data.get('tools', [])[:20]:
            new_tools.append({
                "name": tool.get('name'),
                "url": tool.get('websiteUrl') or f"https://www.futurepedia.io/tool/{tool.get('slug')}",
                "description": tool.get('shortDescription', 'Latest AI Discovery'),
                "category": "New Release"
            })
        
        if new_tools:
            sync_to_supabase(new_tools)
        else:
            raise Exception("No tools in JSON")

    except Exception as e:
        print(f"⚠️ API/RSS failed. Adding daily verified tools instead...")
        # Automation aagakunda daily 5 top tools automatic ga vellela fallback
        fallback = [
            {"name": "Grok 2.0", "url": "https://x.com/grok", "description": "Latest LLM from xAI", "category": "New Release"},
            {"name": "Sora", "url": "https://openai.com/sora", "description": "High fidelity video generation", "category": "Video AI"},
            {"name": "Flux.1", "url": "https://blackforestlabs.ai", "description": "Open weights image model", "category": "Image AI"}
        ]
        sync_to_supabase(fallback)

if __name__ == "__main__":
    scrape_futurepedia_api()