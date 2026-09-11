# InfoEdit project page

Static project page for **InfoEdit: Probing Global Layout Reasoning in Infographic Editing**.

Plain HTML/CSS/JS — no build step. GitHub Pages serves `index.html` from the repository root.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Layout

```
index.html               all page content
static/css/style.css     design system + all component styles
static/js/main.js        nav, scrollspy, taxonomy explorer, results toggle, failure viewer, copy-BibTeX
static/images/           web-sized assets derived from _EMNLP_2026__InfoEdit/figs
  bg-blobs.svg           background gradient
  favicon.svg            tab icon
  scenario.jpg           teaser (Fig. 1)
  framework.jpg          overview (Fig. 2)
  dataset_stats.png      dataset distribution (Fig. 3)
  model_difficulty.png   difficulty breakdown
  error_breakdown_static.png  failure-type distribution
  hint.jpg               interactive selection hint
  gallery/               one example per logical-relation family
  tasks/                 MLLM-as-a-judge rubric figures (one per editing task)
  examples/              data examples
  errors/                before/after failure cases used by the gallery
.nojekyll                serve `static/` as-is
```

## Things to fill in before launch

* **Hero buttons.** Code and Dataset now link to the GitHub repo and the Hugging Face
  dataset. Paper is still a disabled `SOON` button in `index.html`; to enable it, set its
  `href` and drop `soon` from the class plus the `aria-disabled`, `onclick` attributes and
  the `<span class="soon-tag">soon</span>`.
* **BibTeX.** `#bibtex` in `index.html` currently cites an arXiv preprint for 2026 — update the
  entry (and `journal`/`booktitle`) once the paper has a venue or arXiv id.
* **Author links.** Author names are plain text; wrap any in `<a href="…">` to link homepages.
error mode, model, image file and the failure analysis shown under the figure. The editing
instruction is already printed inside each before/after image, so it is not repeated in HTML.
