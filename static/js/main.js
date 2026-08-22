/* ============================================================
   InfoEdit project page — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function syncNav() {
    var y = window.scrollY + 140;
    var current = null;
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- taxonomy explorer ---------- */
  var FAMILIES = [
    {
      key: 'list', name: 'List', share: '82%', templates: 16,
      desc: 'Parallel items stacked in a column or row — the most common organizing structure in real infographics, and the one that most often co-occurs with the other families.',
      contract: 'Items share one axis, so growing or inserting one item must redistribute space across all siblings while keeping their alignment and spacing uniform.'
    },
    {
      key: 'matrix', name: 'Matrix', share: '50%', templates: 6,
      desc: 'A grid of cells indexed by two dimensions, used for comparison tables, feature grids and quadrant charts.',
      contract: 'The grid must stay rectangular: adding or resizing one cell propagates along its whole row and column, and no cell may escape its track.'
    },
    {
      key: 'process', name: 'Process', share: '45%', templates: 16,
      desc: 'An ordered sequence of steps joined by directed connectors — pipelines, timelines, workflows.',
      contract: 'Inserting or moving a step must re-route the arrows and preserve the ordering, so the sequence still reads end to end without skipped or stranded links.'
    },
    {
      key: 'cycle', name: 'Cycle', share: '21%', templates: 7,
      desc: 'A closed loop of stages that returns to its origin, such as a feedback or lifecycle diagram.',
      contract: 'The hardest family in our evaluation: adding a node forces the editor to re-route and re-close the entire loop of connectors, not just make local room.'
    },
    {
      key: 'picture', name: 'Picture', share: '21%', templates: 9,
      desc: 'Image-anchored blocks where a photo or illustration carries a caption, label or statistic.',
      contract: 'Captions and labels stay bound to their image: reflow may rescale or reposition the pair, but must never separate, crop or re-crop the anchor.'
    },
    {
      key: 'relationship', name: 'Relationship', share: '14%', templates: 15,
      desc: 'Association structures — Venn overlaps, radial hubs and comparison pairs — where meaning lives in how the shapes touch.',
      contract: 'Geometry is semantics: overlaps, adjacency and radial ordering must be recomputed so the relation still reads correctly after the edit.'
    },
    {
      key: 'pyramid', name: 'Pyramid', share: '12%', templates: 6,
      desc: 'Tiers stacked in order of magnitude, priority or hierarchy level, with monotone widths.',
      contract: 'Tier order and the width progression encode rank, so reflow must preserve both when a tier is added, resized or re-labelled.'
    },
    {
      key: 'hierarchy', name: 'Hierarchy', share: '6%', templates: 4,
      desc: 'A parent–child tree such as an org chart or taxonomy, drawn with explicit edges.',
      contract: 'Edits must reparent branches correctly and keep every edge attached to the nodes it connects, with sibling subtrees re-spaced around the change.'
    }
  ];

  var taxTabs = document.getElementById('tax-tabs');
  if (taxTabs) {
    FAMILIES.forEach(function (f, i) {
      var b = document.createElement('button');
      b.className = 'tax-tab' + (i === 0 ? ' active' : '');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.innerHTML = f.name + '<span class="tab-share">' + f.share + '</span>';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(taxTabs.children, function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        showFamily(f);
      });
      taxTabs.appendChild(b);
    });

    var taxImg = document.getElementById('tax-img');
    var taxName = document.getElementById('tax-name');
    var taxStats = document.getElementById('tax-stats');
    var taxDesc = document.getElementById('tax-desc');
    var taxContract = document.getElementById('tax-contract');

    function showFamily(f) {
      taxImg.src = 'static/images/gallery/' + f.key + '.jpg';
      taxImg.alt = 'Example of the ' + f.name + ' logical-relation family';
      taxName.textContent = f.name;
      taxStats.textContent = 'Present in ' + f.share + ' of infographics · ' + f.templates + ' templates in the library';
      taxDesc.textContent = f.desc;
      taxContract.textContent = f.contract;
    }
    showFamily(FAMILIES[0]);
  }

  /* ---------- main results table: best-value highlight + metric toggle ---------- */
  var mainTable = document.getElementById('main-results');
  if (mainTable) {
    var dataRows = Array.prototype.filter.call(
      mainTable.tBodies[0].rows,
      function (r) { return !r.classList.contains('group-header'); }
    );

    // highlight the best value in every numeric column
    var colCount = 13; // 12 metrics + Avg.
    for (var c = 1; c <= colCount; c++) {
      var best = -1, bestCells = [];
      dataRows.forEach(function (r) {
        var cell = r.cells[c];
        if (!cell) return;
        var v = parseFloat(cell.textContent);
        if (isNaN(v)) return;
        if (v > best) { best = v; bestCells = [cell]; }
        else if (v === best) { bestCells.push(cell); }
      });
      bestCells.forEach(function (cell) { cell.classList.add('best'); });
    }

    var HIDDEN = [1, 2, 4, 5, 7, 8, 10, 11];   // EC / CP cell indices
    var SR_CELLS = [3, 6, 9, 12];

    function setMode(mode) {
      var srOnly = mode === 'sr';
      // header: metric row
      var metricRow = mainTable.tHead.rows[1];
      Array.prototype.forEach.call(metricRow.cells, function (th, i) {
        // metric row has 12 cells: indices 0..11 map to table columns 1..12
        var col = i + 1;
        th.style.display = srOnly && HIDDEN.indexOf(col) !== -1 ? 'none' : '';
        if (SR_CELLS.indexOf(col) !== -1) th.classList.toggle('col-sep', srOnly);
      });
      // header: group row colspans
      Array.prototype.forEach.call(mainTable.tHead.rows[0].cells, function (th) {
        if (th.getAttribute('colspan') === '3' || th.dataset.fullspan) {
          if (!th.dataset.fullspan) th.dataset.fullspan = '3';
          th.setAttribute('colspan', srOnly ? '1' : th.dataset.fullspan);
        }
      });
      // body
      dataRows.forEach(function (r) {
        Array.prototype.forEach.call(r.cells, function (td, i) {
          if (HIDDEN.indexOf(i) !== -1) td.style.display = srOnly ? 'none' : '';
          if (SR_CELLS.indexOf(i) !== -1) td.classList.toggle('col-sep', srOnly);
        });
      });
    }

    var toggle = document.getElementById('metric-toggle');
    if (toggle) {
      Array.prototype.forEach.call(toggle.querySelectorAll('button'), function (b) {
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(toggle.querySelectorAll('button'), function (o) { o.classList.remove('active'); });
          b.classList.add('active');
          setMode(b.dataset.mode);
        });
      });
    }
  }

  /* ---------- failure case viewer ---------- */
  var CASES = [
    {
      task: 'Insert-Element', error: 'Misplacement', model: 'GPT-Image-2',
      img: 'error_case_add_misplacement.jpg',
      analysis: 'The three new circles were inserted into the Core Demographics radial diagram, but “Marine” is placed in the wrong position — on the opposite side of the diagram, between “Military” and “Space”.'
    },
    {
      task: 'Insert-Element', error: 'Style Change', model: 'GPT-Image-2',
      img: 'error_case_add_style_drift.jpg',
      analysis: 'The five new segments were inserted in the right place, but they do not match the style of the existing segments. Instead of being integrated as arc segments within the main ring, they are rendered as smaller circular nodes branching outward below the cycle.'
    },
    {
      task: 'Insert-Element', error: 'Incomplete Content', model: 'GPT-Image-2',
      img: 'error_case_add_incomplete.jpg',
      analysis: 'The Core Economic Drivers row is incomplete: only three of the four requested cards were inserted, and “Advanced Manufacturing” is missing between “Cleantech Energy” and “Silicon Engineering”.'
    },
    {
      task: 'Expand-Text', error: 'Element Loss', model: 'GPT-Image-2',
      img: 'error_case_expand_element_loss.jpg',
      analysis: '“Bulk pricing” was successfully expanded with the longer description, but the adjacent “Site delivery” card in the top-right of the Chapter 04 “Core strategy” grid has been removed — leaving the grid incomplete and disrupting the original 3×2 layout.'
    },
    {
      task: 'Expand-Text', error: 'Style Change', model: 'GPT-Image-2',
      img: 'error_case_expand_style_drift.jpg',
      analysis: 'The “4.5 Stories” caption was correctly expanded, but the “Broadcasting Spire” label at the top of the Structural Hierarchy pyramid changed from black text on a light background to white text, breaking visual consistency with the original styling.'
    },
    {
      task: 'Swap-Block', error: 'Element Loss', model: 'GPT-Image-2',
      img: 'error_case_swap_element_loss.jpg',
      analysis: 'The swap was only partially executed. “Transfer Cycle” moved to the middle-left position previously occupied by “Core Academic Pillars”, but “Core Academic Pillars” is missing entirely instead of being relocated to the bottom-middle.'
    },
    {
      task: 'Swap-Block', error: 'Style Change', model: 'GPT-Image-2',
      img: 'error_case_swap_style_drift_02.jpg',
      analysis: 'The two modules were swapped in position, but their original styling was not preserved — the ascending size progression of the roadmap steps, which encodes the roadmap order, is lost.'
    },
    {
      task: 'Swap-Block', error: 'Text Rewritten', model: 'Qwen-Image-Edit',
      img: 'qwen_text_rewritten.jpg',
      analysis: 'An open-weight failure mode. The model partially changes the layout, but many original texts, labels and chart annotations are rewritten or corrupted instead of preserved — non-target content is not maintained at all.'
    },
    {
      task: 'Reshape-Canvas', error: 'Structural Break', model: 'GPT-Image-2',
      img: 'error_case_aspect_wrong_element_pair.jpg',
      analysis: 'The “Supply ecology” network diagram has been structurally altered: the connection topology between the nodes no longer matches the original, so the relation the diagram encodes is silently changed.'
    },
    {
      task: 'Reshape-Canvas', error: 'Structural Break', model: 'GPT-Image-2',
      img: 'error_case_aspect_layout.jpg',
      analysis: 'All original content was preserved when rendered as a portrait infographic, but the block ordering does not follow a coherent reading flow — the canvas is re-shaped without being re-organized.'
    },
    {
      task: 'Reshape-Canvas', error: 'Style Change', model: 'GPT-Image-2',
      img: 'error_case_aspect_style_shift_s1.jpg',
      analysis: 'The infographic was re-rendered into a portrait canvas with all original content preserved, but the card styling has been altered — the source palette and visual organization are re-painted rather than carried over.'
    }
  ];

  var viewer = document.getElementById('case-viewer');
  if (viewer) {
    var taskSel = document.getElementById('case-task');
    var pickSel = document.getElementById('case-pick');
    var imgEl = document.getElementById('case-img');
    var tagsEl = document.getElementById('case-tags');
    var analysisEl = document.getElementById('case-analysis');
    var counterEl = document.getElementById('case-counter');
    var filtered = CASES.slice();
    var idx = 0;

    function renderPicker() {
      pickSel.innerHTML = '';
      filtered.forEach(function (c, i) {
        var o = document.createElement('option');
        o.value = String(i);
        o.textContent = c.task + ' — ' + c.error;
        pickSel.appendChild(o);
      });
    }

    function render() {
      if (!filtered.length) return;
      var c = filtered[idx];
      imgEl.src = 'static/images/errors/' + c.img;
      imgEl.alt = c.task + ' failure (' + c.error + '): before and after comparison';
      tagsEl.innerHTML =
        '<span class="tag">' + c.task + '</span>' +
        '<span class="tag error">' + c.error + '</span>' +
        '<span class="tag model">' + c.model + '</span>';
      analysisEl.textContent = c.analysis;
      counterEl.textContent = (idx + 1) + ' / ' + filtered.length;
      pickSel.value = String(idx);
    }

    taskSel.addEventListener('change', function () {
      var t = taskSel.value;
      filtered = t === 'all' ? CASES.slice() : CASES.filter(function (c) { return c.task === t; });
      idx = 0;
      renderPicker();
      render();
    });
    pickSel.addEventListener('change', function () { idx = parseInt(pickSel.value, 10) || 0; render(); });
    document.getElementById('case-prev').addEventListener('click', function () {
      idx = (idx - 1 + filtered.length) % filtered.length; render();
    });
    document.getElementById('case-next').addEventListener('click', function () {
      idx = (idx + 1) % filtered.length; render();
    });

    renderPicker();
    render();
  }

  /* ---------- copy bibtex ---------- */
  var copyBtn = document.getElementById('copy-bib');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = document.getElementById('bibtex').textContent;
      var done = function () {
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  }
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
  }
})();
