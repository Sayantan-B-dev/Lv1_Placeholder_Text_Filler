(function() {
    // DOM Elements
    const templateArea = document.getElementById('promptTemplate');
    const inputsContainer = document.getElementById('inputsContainer');
    const placeholderSpan = document.getElementById('placeholderCount');
    const inputSpan = document.getElementById('inputCount');
    const outputText = document.getElementById('outputText');
    const dropdown = document.getElementById('promptDropdown');

    // Hardcoded prompts
    const hardcodedPrompts = [
        {
            name: "Note Prompt Template",
            template: "Act as a senior software engineer writing structured technical documentation for a public GitHub repository focused on Python and Data Structures & Algorithms.\n\nThe output must read like carefully written engineering notes, not AI-generated content.\n\nStrict Writing Rules:\n- No emojis.\n- No conversational tone.\n- No motivational or instructional phrases.\n- No rhetorical questions.\n- No filler or generic transitions.\n- No references to the writing process.\n- No \"In this article/section we will…\" phrasing.\n- No summary-style conclusions.\n- No self-references.\n- No repetitive sentence structures.\n- Avoid predictable AI phrasing patterns.\n\nTone:\n- Formal, analytical, and precise.\n- Concise but technically deep.\n- Written as personal engineering documentation.\n- Focus on clarity and correctness.\n\nStructure Requirements:\n1. Definition and Concept Overview\n2. Core Principles and Internal Mechanics\n3. Step-by-Step Logical Breakdown\n4. Implementation (Python) with meaningful inline comments\n5. Time and Space Complexity Analysis\n6. Edge Cases and Failure Scenarios\n7. Practical Use Cases\n8. Limitations and Trade-offs (if applicable)\n\nCode Requirements:\n- Use clear variable names.\n- Include comments explaining reasoning, not obvious syntax.\n- Avoid trivial examples unless conceptually necessary.\n- Keep formatting clean and professional.\n\nTopic:\n{{}}"
        }
    ];

    // Utility Functions
    function countPlaceholders(str) {
        const matches = str.match(/\{\{\}\}/g);
        return matches ? matches.length : 0;
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"']/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return '&#039;';
        });
    }

    function refreshInputBadges() {
        const groups = document.querySelectorAll('#inputsContainer .input-group');
        groups.forEach((group, idx) => {
            const badge = group.querySelector('.input-hint');
            if (badge) badge.textContent = idx + 1;
        });
    }

    function updateStats() {
        const phCount = countPlaceholders(templateArea.value);
        const inputCount = document.querySelectorAll('#inputsContainer .input-group').length;
        
        placeholderSpan.textContent = phCount;
        inputSpan.textContent = inputCount;
        
        return { phCount, inputCount };
    }

    // Core Functions
    function addInputField(skipStatsUpdate = false) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';

        const badge = document.createElement('span');
        badge.className = 'input-hint';

        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = 'value for placeholder...';

        wrapper.appendChild(badge);
        wrapper.appendChild(newInput);
        inputsContainer.appendChild(wrapper);

        refreshInputBadges();
        
        if (!skipStatsUpdate) {
            updateStats();
        }
    }

    function syncInputsToTemplate() {
        const phCount = countPlaceholders(templateArea.value);
        const currentCount = document.querySelectorAll('#inputsContainer .input-group').length;

        if (phCount > currentCount) {
            const toAdd = phCount - currentCount;
            for (let i = 0; i < toAdd; i++) {
                addInputField(true);
            }
        }
        
        refreshInputBadges();
        updateStats();
    }

    function generatePrompt() {
        const template = templateArea.value;
        const inputs = Array.from(document.querySelectorAll('#inputsContainer input')).map(inp => inp.value);
        const parts = template.split(/\{\{\}\}/);

        let result = parts[0] || '';

        for (let i = 0; i < parts.length - 1; i++) {
            const value = (i < inputs.length && inputs[i].trim() !== '') ? inputs[i] : '___';
            result += value + (parts[i + 1] || '');
        }

        outputText.innerText = result;
    }

    function loadSelectedPrompt() {
        const selectedTemplate = dropdown.value;
        if (selectedTemplate) {
            templateArea.value = selectedTemplate;
            syncInputsToTemplate();
            generatePrompt();
        }
    }

    function initializeDropdown() {
        // Clear any existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add prompt options
        hardcodedPrompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.template;
            option.textContent = prompt.name;
            dropdown.appendChild(option);
        });
        
        // Keep first option (-- Select a template --) selected by default
        dropdown.selectedIndex = 0;
    }

    function initialize() {
        // Initialize dropdown first
        initializeDropdown();
        
        // Add first input field
        addInputField(true);
        
        // Sync with template
        syncInputsToTemplate();
        
        // Generate initial prompt
        generatePrompt();
    }

    // Event Listeners
    templateArea.addEventListener('input', function() {
        syncInputsToTemplate();
        generatePrompt();
    });

    // Observer for input changes
    const observer = new MutationObserver(function() {
        refreshInputBadges();
        updateStats();
    });
    
    observer.observe(inputsContainer, { childList: true, subtree: false });

    // Expose functions to global scope
    window.addInputField = function() { addInputField(false); };
    window.syncInputsToTemplate = syncInputsToTemplate;
    window.generatePrompt = generatePrompt;
    window.loadSelectedPrompt = loadSelectedPrompt;

    // Initialize everything
    initialize();
})();