# WhiteScreen.wiki

Color screen utility website providing full-screen color displays for focus, photography, design, and relaxation.

## Project Structure

```
/
├── index.html              # Homepage with color grid
├── colors.html             # All colors listing page
├── about.html              # About page
├── faq.html                # FAQ page
├── contact.html            # Contact page
├── sitemap.xml             # XML sitemap for SEO
├── [color]-screen.html     # Individual color pages (60+ pages)
└── assets/
    ├── css/style.css       # Main stylesheet
    ├── js/script.js        # Main JavaScript
    └── img/                # Images and og-images
```

## Color Pages

Each color page includes:
- SEO meta tags (title, description, keywords, canonical)
- Open Graph and Twitter Card tags
- Schema.org JSON-LD (WebApplication + FAQPage)
- Interactive brightness slider with presets
- Color psychology content
- Technical specs (Hex, RGB, HSL, CMYK)
- FAQ accordion
- Related colors sidebar
- Internal linking to similar colors

## Adding New Colors

1. Create `[color]-screen.html` following existing page structure
2. Add color card to `colors.html` grid
3. Add entry to `sitemap.xml`
4. Update homepage `index.html` if adding to featured colors

## Key Files

- **colors.html**: Contains the color grid (~line 447-780) and detailed color insights
- **sitemap.xml**: XML sitemap with all pages listed
- **index.html**: Homepage with featured color buttons

## Tech Stack

- Static HTML/CSS/JS
- No build process required
- Google Fonts: Inter, DM Serif Display

## Commands

```bash
# View in browser
open index.html

# Check file count
ls -la *.html | wc -l
```

## Current Color Count

60 unique color screen pages (as of 2026-06-23)
