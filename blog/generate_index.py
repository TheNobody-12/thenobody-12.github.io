import os
import json
import re

POSTS_DIR = 'blog/posts'
OUTPUT_FILE = 'blog/data/posts.json'

def parse_frontmatter(content):
    # Match YAML frontmatter between ---
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    
    frontmatter_str = match.group(1)
    data = {}
    for line in frontmatter_str.split('\n'):
        line = line.strip()
        if not line or ':' not in line:
            continue
            
        key, val = line.split(':', 1)
        key = key.strip()
        val = val.strip().strip('"\'')
        
        # Parse tags array like ["a", "b"]
        if key == 'tags' and val.startswith('[') and val.endswith(']'):
            # Extract content inside brackets and split by comma
            tags_str = val[1:-1]
            tags = []
            if tags_str:
                for t in tags_str.split(','):
                    tags.append(t.strip().strip('"\''))
            val = tags
            
        data[key] = val
    return data

def main():
    # Ensure directories exist
    if not os.path.exists(POSTS_DIR):
        print(f"Error: Directory {POSTS_DIR} not found.")
        return
        
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith('.md'):
            filepath = os.path.join(POSTS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            data = parse_frontmatter(content)
            
            # Skip drafts
            if str(data.get("draft", "")).lower() == "true":
                continue
                
            if data:
                posts.append({
                    "slug": data.get("slug", filename.replace('.md', '')),
                    "title": data.get("title", ""),
                    "date": data.get("date", ""),
                    "tags": data.get("tags", []),
                    "excerpt": data.get("excerpt", ""),
                    "file": f"posts/{filename}"
                })

    # Sort posts by date descending
    posts.sort(key=lambda x: x.get('date', ''), reverse=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    print(f"✅ Successfully updated {OUTPUT_FILE} with {len(posts)} posts.")

if __name__ == '__main__':
    main()
