# 📖 Bookshelf: Minimal Series Completionist & Library Tracker

An Apple-inspired, minimalist web application to track the books you have read, automatically detect book series, and display missing companion volumes with instant procurement links.

Read books shine in **full vibrant color**, while unread volumes in your series appear in **sleek Apple-style monochrome**, complete with one-click purchase links across major booksellers.

---

## ✨ Features

- **📂 1-Click Goodreads CSV Import:** Import your exported library from Goodreads. Handles Excel formulas, multiline reviews, and standard Goodreads columns.
- **📚 Smart Series Completion Engine:**
  - Extracts series info directly from titles (e.g. `Harry Potter and the Philosopher's Stone (Harry Potter, #1)`).
  - Includes a curated database of iconic literary universes (*Harry Potter*, *The Lord of the Rings*, *Dune*, *The Hunger Games*, *Cosmere*, *Percy Jackson*, etc.).
  - Dynamically queries the **Open Library Search API** for custom or indie series.
- **🎨 Minimal Apple-Grade Aesthetic:**
  - Clean light-grey background (`#f5f5f7`) and pure white containers (`#ffffff`).
  - Floating cards with soft ambient diffuse drop shadows matching Apple Human Interface Guidelines.
  - Frosted glass action pills (`backdrop-blur-md`) with chevron cues.
  - **Fitted Cover Architecture:** Uses dual-layer ambient backdrop and foreground framing so 100% of the book cover artwork is displayed without awkward cropping.
- **🛒 Direct Procurement Links:**
  - Every missing book includes instant links to:
    - **Amazon** (quick search by ISBN / Title)
    - **Bookshop.org** (supports local independent booksellers)
    - **Barnes & Noble**
    - **Google Books** (preview & ebook)
    - **Open Library** (free digital lending archive)
- **⚡ Client-Side & Privacy-First:** 100% runs inside the browser. No login, no database, no trackers. Your reading data never leaves your computer.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/bookshelf-series-tracker.git
cd bookshelf-series-tracker
npm install
```

### 2. Run Local Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates a static production bundle in `dist/`.

---

## 🌐 Deploy to GitHub Pages in 2 Minutes

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the app to GitHub Pages on every push.

### Step-by-Step GitHub Setup:

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Name it `bookshelf` or `series-tracker`.
   - Keep it Public (or Private if you have GitHub Pro).

2. **Push your local repository to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Minimal Apple-grade Bookshelf Series Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages in Repository Settings:**
   - On GitHub, go to **Settings** &rarr; **Pages** (in the left sidebar).
   - Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
   - That's it! GitHub will automatically trigger the workflow and publish your site at:
     ```
     https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
     ```

---

## 📥 How to Export Your Goodreads Library

1. Go to Goodreads: [goodreads.com/review/import](https://www.goodreads.com/review/import).
2. Click **Export Library** at the top right.
3. Wait for the export to generate and download the `.csv` file.
4. In the app, click **Import CSV** and drop your file.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4 (Apple Minimalist Design System)
- **Icons:** Lucide React
- **API:** [Open Library REST & Covers API](https://openlibrary.org/developers/api)
- **Sound Engine:** Synthesized Web Audio API (zero audio file dependencies)
- **Animations:** Canvas Confetti + Hardware-accelerated CSS transforms

---

## 📄 License

MIT License. Free to use, modify, and distribute.
