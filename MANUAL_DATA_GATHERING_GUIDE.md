# Manual Data Gathering Guide for BooksByMax Landing Page

Since Amazon blocks automated scraping, here's the manual process to gather all book data.

## Estimated Time: 1-2 hours
## Books to Process: 10+ titles

## Step 1: Access Your Author Page
1. Go to: https://www.amazon.com/stores/BooksByMax-Designs/author/B0BCD3DT9N
2. Scroll through all books
3. Count how many total books you have

## Step 2: For Each Book, Gather:

### A. ASIN (Amazon Standard Identification Number)
1. Click on the book to go to its product page
2. Look in the URL: `https://www.amazon.com/dp/B0XXXXXXX`
3. The `B0XXXXXXX` part is the ASIN
4. Write it down

### B. Book Title
1. From the product page, copy the exact title
2. Include subtitle if present

### C. Amazon URLs for Different Marketplaces
For each book, you'll need:
- **US**: `https://www.amazon.com/dp/ASIN`
- **UK**: `https://www.amazon.co.uk/dp/ASIN` 
- **CA**: `https://www.amazon.ca/dp/ASIN`
- **AU**: `https://www.amazon.com.au/dp/ASIN`

### D. Cover Image
1. On the product page, right-click the book cover
2. Choose "Save Image As..."
3. Save to: `assets/covers/`
4. Name it clearly: `book_title_clean.jpg`

## Step 3: Fill the Spreadsheet
1. Open: `books_spreadsheet.csv`
2. For each book row:
   - Fill in the ASIN
   - Update Amazon URLs with the ASIN
   - Update Cover_Filename with the saved image name

## Step 4: Quick Method Using Amazon Author Page
If your author page shows all books:
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Refresh the author page
4. Look for API calls containing "product" or "asin"
5. You might find a JSON response with all book data

## Step 5: Alternative - Use KDP Reports
1. Log into KDP dashboard
2. Go to Reports → Royalty Reports
3. Export detailed report
4. It should contain ASINs for all books

## What We Already Know (From Performance Report):

**Top 10 Books by Units Sold:**
1. Dinosaur Kids Coloring Book (Ages 1-4) - 3,308 units
2. Dinosaur Toddler Coloring Book - 1,103 units
3. Birds Coloring Book - 263 units
4. Sermon Notes Journal For Women - 195 units
5. Prayer Journal For Women - 171 units
6. Spider Coloring Book For Kids - 127 units
7. Spider Coloring Book For Toddlers - 114 units
8. Recipe Book (Write Your Own) - 77 units
9. Cute Pumpkin Toddler Coloring Book - 77 units
10. Kids Recipe Book / Cookbook - 69 units

## Template for Manual Recording:

```
Book #1:
Title: [ ]
ASIN: [ ]
US URL: https://www.amazon.com/dp/[ASIN]
UK URL: https://www.amazon.co.uk/dp/[ASIN]
CA URL: https://www.amazon.ca/dp/[ASIN]
AU URL: https://www.amazon.com.au/dp/[ASIN]
Cover saved as: [ ]
Category: [ ]
Age Range: [ ]
```

## After Data Gathering:
1. Run: `./download_covers.sh books_spreadsheet.csv`
2. Check all covers are in `assets/covers/`
3. Update the worksheet with author bio and brand promise
4. Choose platform (Carrd/Framer/Webflow/static)
5. We'll build the landing page!

## Need Help?
If you get stuck or want me to try a different automated approach, let me know. We can also:
- Try using Amazon's Product Advertising API
- Use a browser extension for bulk ASIN extraction
- Work with the KDP CSV exports directly