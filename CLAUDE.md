# PDF to Markdown Converter

A React single-page application that parses PDFs and converts them to Markdown via a multi-stage transformation pipeline.

## Commands

```bash
npm start          # Dev server with hot reload (http://localhost:8080)
npm test           # Run Mocha tests
npm run check      # Lint + test
npm run lint       # ESLint on src/
npm run build      # Development bundle
npm run release    # Production build (minified)
npm run deploy     # Production build → docs/
```

## Architecture

**Flow:** Upload → PDF.js parsing → transformation pipeline → Markdown output

### State Management

`AppState.jsx` is the single central state object. It holds the current view (`UPLOAD → LOADING → RESULT`), raw file buffer, parsed pages, and the ordered list of transformations. No external state management library — plain React state with prop drilling.

### Transformation Pipeline

The core feature. `ResultView.jsx` runs the transformation chain in sequence, each step receiving a `ParseResult` and returning a new one:

1. `CalculateGlobalStats` — font metrics and line spacing analysis
2. `CompactLines` — groups `TextItem` objects into `LineItem` rows
3. `RemoveRepetitiveElements` — filters headers/footers
4. `VerticalToHorizontal` — fixes vertical text
5. `DetectTOC` → `DetectHeaders` → `DetectListItems`
6. `GatherBlocks` → `DetectCodeQuoteBlocks` → `DetectListLevels`
7. `ToTextBlocks` → `ToMarkdown` — final string output

All transformations extend the abstract `Transformation` class, which requires implementing `transform(parseResult)`. `completeTransform()` is optional for deferred changes.

### Data Model Hierarchy

```
PageItem (base)
├── TextItem     — raw text from PDF (has x, y, width, height, font, text)
└── LineItem     — grouped text rows

ParseResult
└── pages[]
    └── items[]  — TextItem or LineItem
```

### PDF Parsing

`LoadingView.jsx` orchestrates PDF.js parsing in 3 stages: metadata → page text (`TextItem` objects) → font resolution. Stage progress is tracked via custom `Progress`/`ProgressStage` classes and rendered with rc-progress.

## Key Files

| File | Role |
|------|------|
| `src/javascript/models/AppState.jsx` | Central state and view controller |
| `src/javascript/components/App.jsx` | View router (UPLOAD / LOADING / RESULT / DEBUG) |
| `src/javascript/components/LoadingView.jsx` | PDF parsing orchestration |
| `src/javascript/components/ResultView.jsx` | Runs pipeline, renders result |
| `src/javascript/models/transformations/` | All transformation steps |
| `src/javascript/models/ParseResult.jsx` | Data structure passed through pipeline |
| `src/javascript/models/Transformation.jsx` | Abstract base class for transformations |

## Tech Stack

- **React 15** with React-Bootstrap 0.30 and Bootstrap 3
- **PDF.js 2.8** for PDF parsing (runs in a web worker via `bundle.worker.js`)
- **Remarkable** for Markdown rendering in preview mode
- **Webpack 5**, Babel, ESLint, Mocha + Chai

## Conventions

- `.jsx` for both components and models
- `static propTypes` on every component
- Enum pattern via `enumify`: `View`, `BlockType`, `WordType`, `WordFormat`
- Object spread (`{...parseResult, pages: newPages}`) for immutability in transformations
- Tests live alongside source with `.spec.js` suffix
- Inline styles in some older components (Bootstrap classes + `styles.css` for overrides)
- `componentWillMount` lifecycle (pre-hooks era React)
