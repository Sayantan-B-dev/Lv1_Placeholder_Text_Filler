# Placeholder Text Filler

A sleek, dark‑themed web tool that replaces `{{}}` placeholders in text with custom values. Built with vanilla HTML, CSS, and JavaScript – no dependencies, no build step.

## Live
[https://sayantan-b-dev.github.io/Lv1_Placeholder_Text_Filler/](https://sayantan-b-dev.github.io/Lv1_Placeholder_Text_Filler/)

## Features

- **Dynamic placeholders** – Write any text using `{{}}` for variables.
- **Auto‑matching inputs** – Input fields are automatically created for every placeholder.
- **Live statistics** – See the number of placeholders and input fields at a glance.
- **Pre‑loaded templates** – Choose from a collection of ready‑to‑use prompt templates (e.g., technical documentation, code review, system design).
- **Dark mode** – Easy on the eyes, modern interface.
- **Responsive design** – Works on desktop, tablet, and mobile.
- **No tracking, no ads, no nonsense** – Runs entirely in your browser.

## How to Use

1. **Select a template** from the dropdown, or write your own in the textarea using `{{}}` for placeholders.
2. **Fill in the values** – Each placeholder gets its own input field (they appear automatically).
3. **Click “Generate prompt”** to see the final text with your values inserted.
4. **Copy the result** (if you want – you can add a copy button easily).

The **“Sync with template”** button ensures the number of input fields matches the number of placeholders.  
The **“Add input”** button is kept for legacy reasons but actually just syncs – inputs are always exactly as many as placeholders.

## Example

**Template:**
```
Write a {{}} story about a {{}} who discovers {{}} and then {{}}.
```

**Inputs:**
- fantasy
- wizard
- magic
- saves the kingdom

**Generated output:**
```
Write a fantasy story about a wizard who discovers magic and then saves the kingdom.
```

## Installation

1. Clone the repository or download the ZIP.
   ```bash
   git clone https://github.com/yourusername/placeholder-text-filler.git
   ```
2. Open `index.html` in any modern browser.
3. That’s it – no server, no build, no installation.

## File Structure

```
placeholder-text-filler/
├── index.html          # Main HTML file
├── style.css           # All styles (dark theme, custom scrollbars, dropdown)
├── script.js           # All JavaScript logic
└── README.md           # This file
```

## Customisation

- **Add more templates** – Edit the `hardcodedPrompts` array in `script.js`.
- **Change the theme** – Modify the CSS variables in `style.css`.
- **Add a copy button** – Uncomment the copy button section in `index.html` and the corresponding JavaScript in `script.js`.


