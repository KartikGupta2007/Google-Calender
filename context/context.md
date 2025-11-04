Got it — let’s break this UI down into a **high‑fidelity, spec‑ready description** so your API (or design system) can consume it. I’ll cover **layout, hierarchy, typography, colors, spacing, and interaction states** in detail.

---

## 🖥️ Overall Layout
- **Mode:** Dark theme interface.
- **Structure:** Two‑pane layout.
  - **Left Sidebar (Navigation):** Vertical column with list categories.
  - **Main Content Area:** Displays the active task list and its tasks.

---

## 📑 Sidebar (Navigation Panel)
- **Background:** Solid dark gray/near‑black (`#1E1E1E` approx).
- **Sections:**
  - **Header/Top:** Contains navigation options.
  - **List Items:** “All tasks,” “Starred,” “My tasks,” “Create new list.”
- **Typography:**
  - Font: Sans‑serif, medium weight.
  - Color: Light gray (`#E0E0E0`) for inactive items.
  - Active item (e.g., “My tasks”): Highlighted with brighter text (`#FFFFFF`) and possibly a subtle background overlay.
- **Spacing:** Each item padded vertically (~12–16px).
- **Hover/Active States:** Likely background highlight with rounded corners (Material‑inspired).

---

## 📋 Main Content Area
- **Background:** Slightly lighter dark tone (`#2A2A2A`).
- **Header Row:**
  - Title: “My Tasks” — larger font size (~18–20px), bold, white.
  - Action Button: “Post” — pill/rectangular button, accent color (blue or purple), white text.
- **Task List:**
  - Each task is a horizontal row.
  - Example task: “Note to: Happy Birthday.”
    - **Text:** White, medium weight.
    - **Label/Tag:** Red pill‑shaped badge with text “1 day left.”
      - Background: Bright red (`#FF5252`).
      - Text: White, small font (~12px).
      - Border radius: Fully rounded (capsule).
- **Add Task Row:**
  - Placeholder text: “Add a task.”
  - Style: Muted gray text (`#AAAAAA`), lighter weight, indicating input affordance.

---

## 🎨 Color Palette (Dark Mode)
- **Background Primary:** #1E1E1E – sidebar.
- **Background Secondary:** #2A2A2A – main content.
- **Text Primary:** #FFFFFF – titles, active items.
- **Text Secondary:** #E0E0E0 – inactive nav items.
- **Accent/Action:** Blue or purple (for “Post” button).
- **Warning/Deadline:** Red (#FF5252) for urgency labels.

---

## 🔠 Typography
- **Font Family:** Clean sans‑serif (likely Google’s Roboto or similar).
- **Weights:** Regular (400) for body, Medium (500) for nav, Bold (600–700) for titles.
- **Sizes:**
  - Sidebar items: ~14–16px.
  - Main title: ~18–20px.
  - Task text: ~14–16px.
  - Labels: ~12px.

---

## 📐 Spacing & Alignment
- **Sidebar width:** ~220–240px.
- **Padding:** 16–20px around main content.
- **Task rows:** ~44–48px tall, with vertical spacing between.
- **Consistent left alignment** for text and icons.

---

## ✨ Interaction & Motion
- **Sidebar items:** Hover → background highlight, text brightens.
- **Add Task:** On focus → expands into input field with cursor.
- **Post button:** Hover → darken/lighten accent shade, ripple effect (Material Design).
- **Task deadlines:** Badge may pulse or change shade as deadline approaches.
