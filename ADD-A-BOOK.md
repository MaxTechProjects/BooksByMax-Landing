# How to Add a Book to BooksByMax Designs

With the completion of the Phase 2 Book Data Engine, the BooksByMax landing page is now fully data-driven. You no longer need to edit HTML to add books, update featured titles, or create new categories.

Everything is controlled by the `books.json` file.

---

## The 3-Step Workflow

To add a new book to the site, follow these three simple steps:

### Step 1: Add the Cover Image
1. Save your book cover image as a `.jpg` or `.png` file.
2. Name it something clear and lowercase, like `my_new_book.jpg`.
3. Upload or move the image into the `assets/covers/` directory in the repository.

### Step 2: Add the Book to `books.json`
1. Open the `books.json` file in the root of the repository.
2. Scroll down to the `"books"` array.
3. Copy an existing book block, paste it at the end of the array (don't forget the comma between blocks!), and update the details.

Here is the template for a book entry:

```json
{
  "id": "unique-book-slug",
  "title": "The Exact Book Title",
  "asin": "B0XXXXXXXX",
  "amazon_urls": {
    "us": "https://www.amazon.com/dp/B0XXXXXXXX",
    "uk": "https://www.amazon.co.uk/dp/B0XXXXXXXX",
    "ca": "https://www.amazon.ca/dp/B0XXXXXXXX",
    "au": "https://www.amazon.com.au/dp/B0XXXXXXXX"
  },
  "category": "coloring-books",
  "subcategory": "Kids Coloring",
  "age_range": "Kids",
  "description": "A 1-2 sentence description of the book that will appear on the card.",
  "cover_filename": "my_new_book.jpg",
  "featured": false,
  "featured_badge": null,
  "display_order": 10,
  "sales_count": 0,
  "rating": 0,
  "review_count": 0,
  "price_usd": 7.99,
  "pages": 50,
  "publisher": "BooksByMax Designs",
  "published_year": 2024
}
```

### Step 3: Commit and Push
Once you save `books.json` and commit the changes to the `main` branch, GitHub Pages will automatically rebuild the site. The new book will appear in its category section immediately.

---

## Managing Featured Books

The "Featured Books" section at the top of the page is generated automatically based on the `featured` flag in `books.json`.

To feature a book:
1. Set `"featured": true` on the book's JSON entry.
2. (Optional) Add a `"featured_badge"` like `"Best Seller"`, `"Trending"`, `"Popular"`, or `"New"`.
3. The engine will automatically display up to 6 featured books, sorted by `display_order` and then by `sales_count`.

To remove a book from the featured section, simply change `"featured": true` to `"featured": false`.

---

## Adding a New Category

If you publish a book that doesn't fit into the existing categories (Coloring Books, Journals, Cookbooks), you can create a new category without touching the HTML.

1. Open `books.json`.
2. Find the `"categories"` array at the top of the file.
3. Add a new category block:

```json
{
  "id": "activity-books",
  "label": "Activity Books",
  "icon": "🧩",
  "description": "Fun puzzles, mazes, and brain games for kids.",
  "color_theme": "activity",
  "display_order": 4
}
```

4. When you add a book, set its `"category"` field to match the new category `"id"` (e.g., `"activity-books"`).
5. The engine will automatically generate a new section on the page, complete with the icon, description, and a grid of all books in that category.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **The site is blank or broken** | You likely have a syntax error in `books.json` (like a missing comma or unmatched quote). Use a JSON validator like [JSONLint](https://jsonlint.com/) to check the file. |
| **The cover image is missing** | Ensure the `"cover_filename"` exactly matches the file in `assets/covers/`, including the extension (`.jpg` vs `.jpeg`). |
| **A book isn't showing up** | Check that the `"category"` ID on the book exactly matches one of the IDs in the `"categories"` array. |
| **Changes aren't live yet** | GitHub Pages can take 1-3 minutes to deploy. You may also need to hard-refresh your browser (Ctrl+F5 or Cmd+Shift+R) to clear the cache. |
