# Google Calendar App Bar

A drop-in top navigation bar component that matches Google Calendar's dark theme design. Built using only existing CSS classes and variables from `styles.css` - no hard-coded values, no inline styles.

## Files

- **appbar.html** - Complete HTML structure for the top navigation bar
- **appbar.js** - Event handlers and interactions (no visual styling)
- **README.md** - This file

## Features

### Left Cluster (in order)
1. Hamburger menu icon
2. Google Calendar logo with "Calendar" text
3. "Today" pill button
4. Previous/Next navigation buttons
5. Dynamic date label (e.g., "6 June 2031")

### Right Cluster (in order)
1. Search icon button
2. Help icon button
3. Settings icon button (with menu support)
4. View selector pill dropdown ("Day ▾")
5. Segmented control toggle (Calendar/Tasks)
6. Google apps grid icon
7. User avatar button

## Classes Leveraged from styles.css

### Layout & Container Classes
- `gb_Jd`, `gb_Md`, `gb_2c` - Header container with flex layout and spacing
- `gb_Rd`, `gb_qd`, `gb_rd` - Left/right cluster wrappers
- `gb_Tc`, `gb_Uc`, `gb_ie` - Logo container styling
- `gb_j`, `gb_qe`, `gb_se`, `gb_re`, `gb_ue` - Navigation controls wrapper

### Button Classes
- `AeBiU-LgbsSe` - Filled pill button base
- `AeBiU-LgbsSe-OWXEXe-SfQLQb-suEOdc` - Pill button variant
- `pYTkkf-Bz112c-LgbsSe` - Icon button base
- `pYTkkf-Bz112c-LgbsSe-OWXEXe-SfQLQb-suEOdc` - Icon button variant
- `X2i7Ne`, `belXNd`, `I2n60c`, `UZLCCd` - Button sizing and styling modifiers

### Segmented Control Classes
- `hQEYDb`, `OhA4E`, `WwL44e`, `fTiamc` - Segmented control container
- `VAKbPe`, `VJmZo`, `pVxgue`, `pFqWHe`, `lKgjLd` - Segmented button styling
- `vmjVWb`, `wwPY5`, `oOsXNe` - Button content wrappers
- `GWEJVd`, `HhUn9`, `u8fJAd`, `blFxwc` - Icon and text styling

### Menu Classes
- `tB5Jxf-xl07Ob-XxIAqe-OWXEXe-oYxtQd` - Menu trigger wrapper
- `tB5Jxf-xl07Ob-XxIAqe`, `hxbWqd`, `O68mGe-xl07Ob` - Menu container
- `aqdrmf-rymPhb`, `O68mGe-hqgu2c` - Menu list (role="menu")
- `aqdrmf-rymPhb-ibnC6b` - Menu item styling with hover/focus states
- `aqdrmf-rymPhb-fpDzbe-fmcmS` - Menu item label text

### Icon & Text Classes
- `XjoK4b` - Icon button state layer
- `UTNHae` - Ripple effect container
- `pYTkkf-Bz112c-kBDsod-Rtc0Jf` - Icon wrapper
- `VfPpkd-kBDsod`, `notranslate` - Icon SVG styling
- `NMm5M`, `hhikbc` - Icon sizing classes
- `google-material-icons` - Material icons font support

### Focus & Interaction Classes
- `pYTkkf-Bz112c-UHGRz` - Focus ring styling
- `pYTkkf-Bz112c-RLmnJb` - Hover state overlay
- `AeBiU-RLmnJb` - Pill button hover overlay
- `AeBiU-kBDsod-Rtc0Jf` - Pill button icon states

### Tooltip Classes
- `ne2Ple-oshW8e-V67aGc` - Tooltip container
- `data-is-tooltip-wrapper="true"` - Tooltip wrapper attribute

### Color & Theme Variables Used
- `--gm3-sys-color-background` - Header background (#131314)
- `--gm3-sys-color-on-surface` - Primary text (#e3e3e3)
- `--gm3-sys-color-surface-container` - Button backgrounds
- `--gm3-sys-color-surface-container-high` - Elevated surfaces
- `--gm3-sys-color-primary` - Accent color for active states
- `--gm3-sys-color-on-primary` - Text on primary surfaces
- `--gm3-icon-button-standard-icon-size` - Icon sizing (20px)
- `--gm3-menu-surface-container-color` - Menu background
- `--gm3-dialog-z-index` - Menu z-index layering

### Spacing & Sizing Variables
- `padding: 8px` - Header padding from styles.css line 265
- Various button heights and icon sizes from component tokens
- Focus ring sizes from `--gm3-*` variables

## Integration

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/styles.css">
</head>
<body>
  <!-- Include the app bar -->
  <header class="gb_Jd gb_Md gb_2c" role="banner">
    <!-- ... (copy content from appbar.html) -->
  </header>

  <!-- Your page content -->
  <main>
    <!-- Content here -->
  </main>

  <script src="path/to/appbar.js"></script>
</body>
</html>
```

### Listening to Events

All interactions dispatch custom events that bubble to `document`:

```javascript
// Today button clicked
document.addEventListener('appbar:today', (e) => {
  console.log('Navigate to today');
  // Your logic here
});

// Navigation buttons
document.addEventListener('appbar:prev', (e) => {
  console.log('Go to previous period');
});

document.addEventListener('appbar:next', (e) => {
  console.log('Go to next period');
});

// Search opened
document.addEventListener('appbar:search-open', (e) => {
  console.log('Open search interface');
});

// View changed
document.addEventListener('appbar:view-change', (e) => {
  console.log('View changed to:', e.detail.view);
  // e.detail.view will be 'day', 'week', 'month', or 'year'
});

// Segment toggled
document.addEventListener('appbar:segment', (e) => {
  console.log('Segment changed to:', e.detail.segment);
  // e.detail.segment will be 'calendar' or 'tasks'
});

// Settings clicked
document.addEventListener('appbar:settings', (e) => {
  console.log('Open settings');
});

// Help clicked
document.addEventListener('appbar:help', (e) => {
  console.log('Open help');
});

// Apps grid clicked
document.addEventListener('appbar:apps', (e) => {
  console.log('Open Google apps menu');
});

// Account menu clicked
document.addEventListener('appbar:account-menu', (e) => {
  console.log('Open account menu');
});
```

### Updating the Date Label

The JavaScript exposes a global `appbar` object with helper functions:

```javascript
// Update the date label dynamically
window.appbar.setCurrentLabel('15 March 2024');

// Programmatically change view
window.appbar.selectView('week'); // Updates UI and dispatches event

// Programmatically change segment
window.appbar.selectSegment('tasks'); // Updates UI and dispatches event
```

## Accessibility

- All buttons have proper `aria-label` attributes
- View selector has `aria-haspopup="menu"` and `aria-expanded` states
- Menu follows ARIA menu pattern with `role="menu"` and `role="menuitem"`
- Segmented control uses `role="radiogroup"` and `role="radio"` with `aria-checked`
- Keyboard navigation:
  - **Arrow keys** navigate menu items
  - **Enter/Space** activate buttons and select menu items
  - **Escape** closes open menus
  - **Tab** moves between focusable elements
- Focus rings use the same styles from `styles.css`

## Sticky Behavior

The header uses `role="banner"` for semantic HTML. To make it sticky:

```css
header[role="banner"] {
  position: sticky;
  top: 0;
  z-index: var(--gm3-dialog-z-index);
}
```

(This styling is already present in `styles.css`)

## Responsive Behavior

The bar layout uses flexbox from the CSS classes and will compress gaps on smaller screens. Icons are sized using CSS variables that can be adjusted per breakpoint if needed in `styles.css`.

## No Hard-Coded Values

This component strictly adheres to the constraints:
- ✅ All colors from CSS variables (`--gm3-sys-color-*`)
- ✅ All spacing from existing CSS classes
- ✅ All sizes from CSS variables (`--gm3-icon-button-*`, etc.)
- ✅ All hover/focus states from existing class patterns
- ✅ All borders, shadows, radii from theme tokens
- ✅ No inline `style=""` attributes in HTML
- ✅ No numeric values in JavaScript (only class/attribute manipulation)

## Browser Support

Works in all modern browsers that support:
- CSS custom properties (CSS variables)
- CustomEvent API
- ES6 JavaScript (can be transpiled if needed)

## Notes

- The logo image URL points to Google's CDN. Replace with your own if needed.
- The avatar uses a generic icon SVG. Customize the avatar section for your use case.
- Menu items can be extended by adding more `<li role="menuitem">` elements following the same pattern.
- All visual adjustments should be made in `styles.css` by modifying the CSS variables or adding new utility classes (never editing this component directly).
