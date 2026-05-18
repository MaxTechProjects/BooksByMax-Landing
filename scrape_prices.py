#!/usr/bin/env python3
"""
BooksByMax — Amazon Price Scraper
Scrapes actual Amazon US prices for all 102 books, updates spreadsheet + books.json
"""
import json, os, subprocess, re, time, sys
from collections import Counter

SCRAPE_LOG = "scrape_progress.log"

def scrape_price(asin, timeout=20):
    """Scrape Amazon US price for a given ASIN. Returns (price_float, elapsed_seconds) or (None, elapsed)."""
    headers = [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
    ]
    cmd = ['curl', '-s', '-L', '--compressed', '-m', str(timeout)] + \
           sum([['-H', h] for h in headers], []) + [f'https://www.amazon.com/dp/{asin}']
    
    try:
        t0 = time.time()
        result = subprocess.check_output(cmd, timeout=timeout + 5)
        html = result.decode('utf-8', errors='replace')
        elapsed = time.time() - t0
    except Exception as e:
        return None, 0
    
    # Pattern 1: a-price with a-offscreen
    price_match = re.search(
        r'a-price[^>]*>.*?<span[^>]*class="[^"]*a-offscreen[^"]*"[^>]*>\$?([0-9.]+)',
        html, re.DOTALL
    )
    if price_match:
        return float(price_match.group(1)), elapsed
    
    # Pattern 2: "Paperback", "Kindle", or "Hardcover" followed by $X.XX
    for fmt in ['Paperback', 'Kindle', 'Hardcover']:
        idx = html.find(fmt)
        if idx >= 0:
            pm = re.search(r'\$(\d+\.\d{2})', html[idx:idx+300])
            if pm:
                return float(pm.group(1)), elapsed
    
    return None, elapsed


def main():
    # Load books
    with open('/Users/maxhome/BooksByMax-Landing/books.json') as f:
        data = json.load(f)
    books = data['books']
    
    print(f"📚 Total books: {len(books)}")
    print(f"💰 Current prices: all ${books[0].get('price_usd', 0):.2f} (placeholder)")
    print()
    
    results = {}  # asin -> price
    
    # Check if we have previous progress to resume from
    if os.path.exists(SCRAPE_LOG):
        with open('/Users/maxhome/BooksByMax-Landing/' + SCRAPE_LOG) as f:
            for line in f:
                line = line.strip()
                if ':' in line and not line.startswith('#'):
                    parts = line.split(':')
                    a = parts[0].strip()
                    try:
                        p = float(parts[1].strip().replace('$', ''))
                        results[a] = p
                    except:
                        pass
        print(f"♻️  Resuming from previous progress ({len(results)} already scraped)")
    
    # Process each book
    for i, book in enumerate(books):
        asin = book['asin']
        
        # Skip if already scraped
        if asin in results:
            continue
        
        # Scrape with retry
        price = None
        for attempt in range(2):
            price, elapsed = scrape_price(asin)
            if price is not None:
                break
            if attempt == 0:
                time.sleep(3)  # Wait before retry
        
        results[asin] = price
        
        # Log progress
        if price:
            status = f"${price:.2f} ({elapsed:.1f}s)"
        else:
            status = "NOT FOUND"
        
        # Progress indicator
        done = len(results)
        pct = done / len(books) * 100
        bar_len = 30
        filled = int(bar_len * done / len(books))
        bar = '█' * filled + '░' * (bar_len - filled)
        
        print(f"  [{bar}] {done}/{len(books)} ({pct:.0f}%) — {asin}: {status:30s} {book['title'][:40]}")
        
        # Save progress after each
        with open('/Users/maxhome/BooksByMax-Landing/' + SCRAPE_LOG, 'w') as f:
            for a, p in results.items():
                if p:
                    f.write(f"{a}: ${p:.2f}\n")
                else:
                    f.write(f"{a}: NOT_FOUND\n")
        
        # Be nice to Amazon's servers
        time.sleep(1.5)
    
    # ===== RESULTS =====
    print("\n" + "="*60)
    print("SCRAPING COMPLETE")
    print("="*60)
    
    found = {k: v for k, v in results.items() if v is not None}
    not_found = {k: v for k, v in results.items() if v is None}
    
    print(f"\n✅ Found prices: {len(found)}")
    print(f"❌ Not found: {len(not_found)}")
    
    if found:
        prices_list = list(found.values())
        print(f"\n📊 Price stats:")
        print(f"   Min: ${min(prices_list):.2f}")
        print(f"   Max: ${max(prices_list):.2f}")
        print(f"   Avg: ${sum(prices_list)/len(prices_list):.2f}")
        
        price_dist = Counter(prices_list).most_common(10)
        print(f"\n   Most common prices:")
        for p, c in price_dist:
            bar = '█' * c
            print(f"     ${p:.2f}: {c} {bar}")
    
    # Update books.json
    updated_count = 0
    for book in books:
        asin = book['asin']
        if asin in found:
            old_price = book.get('price_usd')
            new_price = found[asin]
            if old_price != new_price:
                book['price_usd'] = new_price
                updated_count += 1
    
    with open('/Users/maxhome/BooksByMax-Landing/books.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n📝 Updated books.json: {updated_count} prices changed")
    
    # Generate simple price lookup CSV
    with open('/Users/maxhome/BooksByMax-Landing/books_prices.csv', 'w') as f:
        f.write("ASIN,Title,Price_USD\n")
        for book in books:
            asin = book['asin']
            price = results.get(asin, book.get('price_usd', 0))
            if price:
                f.write(f"{asin},{book['title']},{price:.2f}\n")
            else:
                f.write(f"{asin},{book['title']},UNKNOWN\n")
    print(f"📋 Saved books_prices.csv")
    
    # Print not found for manual lookup
    if not_found:
        print(f"\n⚠️  Books needing manual price lookup ({len(not_found)}):")
        for asin in not_found:
            for book in books:
                if book['asin'] == asin:
                    print(f"   {asin}: {book['title']} — https://www.amazon.com/dp/{asin}")
                    break

if __name__ == '__main__':
    main()
