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
    },
    {
        name: "Code Review Expert",
        template: "Act as a senior software engineer conducting a thorough code review. Analyze the following code for:\n\n1. Code Quality and Maintainability\n2. Performance Bottlenecks\n3. Security Vulnerabilities\n4. Error Handling\n5. Architecture and Design Patterns\n6. Testing Coverage\n7. Documentation Completeness\n8. Best Practices Violations\n\nProvide specific line-by-line feedback with severity levels (Critical, Major, Minor, Suggestion). Include code examples for improvements where applicable.\n\nLanguage/Framework: {{}}\nCode to review:\n{{}}"
    },
    {
        name: "System Design Interview",
        template: "Act as a system design interviewer at a top tech company. Help me design {{}}.\n\nCover these aspects:\n1. Requirements (Functional and Non-functional)\n2. Capacity Estimation and Constraints\n3. Data Model and Schema Design\n4. High-Level System Architecture\n5. Detailed Component Design\n6. API Design\n7. Database Choice and Rationale\n8. Caching Strategy\n9. Load Balancing and Scaling\n10. Fault Tolerance and Reliability\n11. Monitoring and Alerting\n12. Trade-offs and Alternatives\n\nScale expectations: {{}} users, {{}} requests per second.\n\nAdditional constraints: {{}}"
    },
    {
        name: "Technical Blog Post",
        template: "Write a technical blog post about {{}} targeting experienced {{}} developers.\n\nStructure:\n- Hook: Start with a real-world problem\n- Context: Why this topic matters\n- Deep Dive: Technical explanation with code examples\n- Common Pitfalls: Mistakes to avoid\n- Best Practices: Production-ready approaches\n- Performance Considerations: Benchmarks and optimizations\n- Conclusion: Key takeaways\n\nTone: Authoritative but approachable, like a senior engineer sharing knowledge.\nInclude {{}} code snippets and {{}} diagrams description.\nWord count target: {{}} words."
    },
    {
        "name": "LeetCode Problem Solver",
        "template": "Act as a competitive programming coach. Solve this LeetCode problem step by step:\n\nProblem: {{}}\nDifficulty: {{}}\n\nProvide:\n1. Problem understanding and edge cases\n2. Brute force approach with complexity\n3. Optimized approach intuition\n4. Step-by-step algorithm\n5. Code implementation in {{}}\n6. Time and space complexity analysis\n7. Test cases with explanations\n8. Alternative solutions and trade-offs\n9. Key patterns to recognize for similar problems\n\nMake sure to explain the thought process thoroughly."
    },
    {
        "name": "API Documentation Writer",
        "template": "Create comprehensive API documentation for the following endpoint:\n\nEndpoint: {{}}\nMethod: {{}}\nDescription: {{}}\n\nInclude:\n- Authentication requirements\n- Request headers\n- Request body schema with examples\n- Query parameters\n- Path parameters\n- Successful response structure (200)\n- Error responses (4xx, 5xx) with codes\n- Rate limiting information\n- Curl examples\n- JavaScript/Python examples\n- Edge cases and limitations\n- Changelog if applicable\n\nFormat in clean Markdown with proper code blocks."
    },
    {
        "name": "Database Schema Designer",
        "template": "Design a database schema for {{}}.\n\nRequirements:\n{{}}\n\nProvide:\n1. Entity-Relationship Diagram (text description)\n2. Tables with columns, data types, constraints\n3. Primary keys and foreign keys\n4. Indexes with rationale\n5. Partitioning strategy if needed\n6. Migration strategy\n7. Query patterns and optimization\n8. Data growth estimate: {{}}\n9. Backup and recovery strategy\n10. Sharding considerations for scale\n\nDatabase system: {{}}"
    },
    {
        "name": "DevOps Pipeline Architect",
        "template": "Design a CI/CD pipeline for a {{}} application.\n\nTech stack: {{}}\nRepository: {{}}\nDeployment target: {{}}\n\nInclude:\n1. Pipeline stages with justification\n2. Build steps and optimizations\n3. Test strategy (unit, integration, e2e)\n4. Security scanning tools\n5. Artifact management\n6. Environment strategy (dev/staging/prod)\n7. Rollback strategy\n8. Monitoring and observability\n9. Notifications and alerts\n10. Compliance and governance checks\n11. Estimated pipeline duration\n12. Tools recommendation with alternatives\n\nProvide YAML configuration examples for {{}}."
    },
    {
        "name": "Frontend Architecture",
        "template": "Design a frontend architecture for {{}}.\n\nRequirements:\n- Users: {{}}\n- Features: {{}}\n- Performance targets: {{}}\n- Target browsers: {{}}\n\nCover:\n1. Framework choice and rationale\n2. State management approach\n3. Folder structure\n4. Component architecture\n5. Styling solution\n6. API layer design\n7. Authentication flow\n8. Routing strategy\n9. Bundle optimization\n10. Code splitting strategy\n11. Caching strategy\n12. Error boundaries and fallbacks\n13. Analytics implementation\n14. PWA considerations if needed\n15. Testing strategy\n\nInclude code examples for key patterns."
    },
    {
        "name": "Machine Learning Engineer",
        "template": "Act as a machine learning engineer. Design a solution for {{}}.\n\nProblem type: {{}}\nData available: {{}}\nSuccess metrics: {{}}\n\nProvide:\n1. Problem framing and assumptions\n2. Data preprocessing pipeline\n3. Feature engineering ideas\n4. Model selection with rationale\n5. Training strategy\n6. Evaluation methodology\n7. Hyperparameter tuning approach\n8. Model deployment strategy\n9. Monitoring and drift detection\n10. Retraining pipeline\n11. Ethical considerations and biases\n12. Baseline performance expectations\n\nInclude pseudocode for key components."
    },
    {
        "name": "Security Audit Report",
        "template": "Conduct a security audit for {{}}.\n\nScope: {{}}\n\nAnalyze:\n1. Authentication vulnerabilities\n2. Authorization issues\n3. Input validation flaws\n4. Data exposure risks\n5. Injection vulnerabilities (SQL, NoSQL, command)\n6. Cross-site scripting (XSS)\n7. Cross-site request forgery (CSRF)\n8. Insecure dependencies\n9. Security misconfigurations\n10. Session management issues\n11. Rate limiting gaps\n12. Business logic flaws\n\nFor each finding:\n- Severity (Critical/High/Medium/Low)\n- Description\n- Impact\n- Reproduction steps\n- Remediation recommendation\n- Code example of fix\n\nProvide executive summary and prioritized action plan."
    },
    {
        "name": "Technical Interview Questions",
        "template": "Generate technical interview questions for a {{}} position.\n\nExperience level: {{}}\nTech stack: {{}}\n\nCreate:\n1. {{}} behavioral questions\n2. {{}} coding problems with varying difficulty\n3. {{}} system design questions\n4. {{}} architecture questions\n5. {{}} debugging scenarios\n6. {{}} conceptual questions\n7. {{}} best practices questions\n\nFor each question include:\n- What it tests\n- Expected answer points\n- Follow-up questions\n- Red flags to watch for\n- Scoring rubric\n\nAlso provide a interview scorecard template."
    },
    {
        "name": "Project Estimator",
        "template": "Estimate the effort for building {{}}.\n\nProject type: {{}}\nTeam size: {{}}\nConstraints: {{}}\n\nProvide:\n1. Requirements breakdown\n2. Technical complexity assessment\n3. Unknowns and risks\n4. Development phases\n5. Time estimates per phase (optimistic/pessimistic/realistic)\n6. Resource allocation\n7. Dependencies and blockers\n8. Testing effort\n9. Documentation effort\n10. Deployment and rollout effort\n11. Maintenance considerations\n12. Contingency buffer\n13. Total timeline with milestones\n14. Cost estimation if applicable\n\nInclude assumptions and confidence level."
    },
    {
        "name": "Code Refactoring Plan",
        "template": "Create a refactoring plan for {{}}.\n\nCurrent codebase: {{}}\nIssues to address: {{}}\n\nProvide:\n1. Current state analysis\n2. Goals and success criteria\n3. Risk assessment\n4. Refactoring strategy (strangler fig, incremental, rewrite)\n5. Phase breakdown with milestones\n6. Testing strategy during refactor\n7. Feature flags approach\n8. Rollback plan\n9. Performance considerations\n10. Team coordination\n11. Timeline estimates\n12. Code review checklist\n13. Documentation updates needed\n\nInclude specific code examples for before/after."
    },
    {
        "name": "Microservices Design",
        "template": "Design a microservices architecture for {{}}.\n\nDomain: {{}}\nScale: {{}}\n\nCover:\n1. Service boundaries and decomposition\n2. Communication protocols (sync/async)\n3. API gateway design\n4. Service discovery\n5. Configuration management\n6. Database per service strategy\n7. Distributed transactions handling\n8. Saga pattern implementation\n9. CQRS if applicable\n10. Event sourcing considerations\n11. Monitoring and tracing\n12. Logging aggregation\n13. Circuit breakers and resilience\n14. Deployment strategy\n15. Versioning approach\n16. Security between services\n\nProvide service interaction diagrams in text."
    },
    {
        "name": "Performance Optimization",
        "template": "Optimize the performance of {{}}.\n\nCurrent metrics: {{}}\nTarget metrics: {{}}\n\nAnalyze and provide:\n1. Performance profiling approach\n2. Identified bottlenecks\n3. Database query optimization\n4. Caching strategy improvements\n5. Code-level optimizations\n6. Memory usage optimization\n7. CPU usage optimization\n8. I/O optimization\n9. Network optimization\n10. Frontend optimizations\n11. CDN and edge computing\n12. Compression strategies\n13. Lazy loading implementation\n14. Benchmarking methodology\n15. Expected improvements with measurements\n\nInclude specific code changes with before/after examples."
    },
    {
        "name": "Technical Onboarding Guide",
        "template": "Create a technical onboarding guide for new developers joining a {{}} project.\n\nTech stack: {{}}\nTeam size: {{}}\nProject complexity: {{}}\n\nInclude:\n1. Development environment setup (step by step)\n2. Repository structure overview\n3. Key dependencies and why they're used\n4. Local build and run instructions\n5. Testing setup and how to run tests\n6. Debugging techniques\n7. Common development workflows\n8. Code review process\n9. Deployment process overview\n10. Monitoring and logging access\n11. Documentation resources\n12. Architecture overview with diagrams\n13. Key code areas to understand first\n14. Common pitfalls and how to avoid them\n15. Who to contact for different areas\n\nEstimated time to complete: {{}}"
    },
    {
        "name": "Error Handling Strategy",
        "template": "Design an error handling strategy for {{}}.\n\nApplication type: {{}}\nCriticality: {{}}\n\nCover:\n1. Error classification taxonomy\n2. Graceful degradation approach\n3. Retry strategies with backoff\n4. Circuit breaker implementation\n5. Fallback mechanisms\n6. User-facing error messages\n7. Logging and monitoring\n8. Alerting thresholds\n9. Error tracking tools\n10. Debug information collection\n11. Compliance and audit requirements\n12. Testing error scenarios\n13. Recovery procedures\n14. Post-mortem process\n\nProvide code examples for {{}} language/framework."
    },
    {
        "name": "Database Migration Plan",
        "template": "Create a database migration plan from {{}} to {{}}.\n\nCurrent schema size: {{}}\nDowntime allowance: {{}}\n\nProvide:\n1. Pre-migration assessment\n2. Schema mapping and transformation\n3. Data validation strategy\n4. Migration approaches (blue-green, parallel, ETL)\n5. Timeline with phases\n6. Rollback strategy\n7. Performance considerations\n8. Data consistency checks\n9. Application code changes needed\n10. Testing strategy\n11. Cutover plan\n12. Post-migration verification\n13. Monitoring during migration\n14. Communication plan\n\nInclude sample migration scripts and rollback procedures."
    },
    {
        "name": "API Rate Limiting Design",
        "template": "Design a rate limiting system for {{}}.\n\nAPI users: {{}}\nExpected traffic: {{}}\n\nCover:\n1. Rate limiting algorithms (token bucket, leaky bucket, sliding window)\n2. Distributed rate limiting approach\n3. Storage choice (Redis, etc.)\n4. Key design (user, IP, API key)\n5. Limit tiers and quotas\n6. Response headers for limits\n7. Error responses\n8. Burst handling\n9. Throttling vs blocking\n10. Monitoring and alerting\n11. Analytics and reporting\n12. Testing strategy\n13. Bypass mechanisms for emergencies\n14. Implementation considerations\n\nProvide pseudocode or code examples."
    },
    {
        "name": "Feature Flag System",
        "template": "Design a feature flag system for {{}}.\n\nRequirements:\n- Users: {{}}\n- Environments: {{}}\n- Use cases: {{}}\n\nCover:\n1. Flag types (release, experiment, ops, permission)\n2. Flag configuration storage\n3. Targeting rules (user segments, percentages)\n4. SDK/client implementation\n5. Management UI\n6. Flag evaluation performance\n7. Caching strategy\n8. Rollout strategies (canary, blue-green)\n9. A/B testing integration\n10. Flag lifecycle management\n11. Cleanup process\n12. Audit logging\n13. Monitoring and metrics\n14. Security considerations\n15. Disaster recovery\n\nProvide API design and code examples."
    },
    {
        "name": "Technical Debt Register",
        "template": "Create a technical debt register for {{}}.\n\nCurrent issues: {{}}\n\nFor each debt item document:\n1. Description and location\n2. Classification (code, architecture, test, docs, infra)\n3. Impact assessment\n4. Estimated effort to fix\n5. Business value of fixing\n6. Risk of not fixing\n7. Dependencies\n8. Suggested solution approach\n9. Priority (P0-P3)\n10. Owner\n11. Target resolution date\n\nProvide prioritization matrix and quarterly roadmap for addressing top {{}} items."
    },
    {
        "name": "Code Generator Prompt",
        "template": "Generate {{}} code for {{}}.\n\nRequirements:\n{{}}\n\nConstraints:\n- Language version: {{}}\n- Framework: {{}}\n- Dependencies: {{}}\n- Coding standards: {{}}\n\nProvide:\n1. Complete implementation with comments\n2. Error handling\n3. Input validation\n4. Unit tests with {{}} testing framework\n5. Usage examples\n6. Performance considerations\n7. Edge cases handled\n8. Documentation comments\n\nMake the code production-ready with proper logging and monitoring hooks."
    },
    {
        "name": "Software Architecture Review",
        "template": "Review the software architecture for {{}}.\n\nArchitecture document/description:\n{{}}\n\nEvaluate:\n1. Adherence to requirements\n2. Scalability approach\n3. Performance characteristics\n4. Security considerations\n5. Maintainability and modularity\n6. Technology choices and trade-offs\n7. Data flow and consistency\n8. Failure modes and resilience\n9. Monitoring and observability\n10. Deployment complexity\n11. Testing strategy alignment\n12. Documentation completeness\n13. Team skills alignment\n14. Cost implications\n15. Future extensibility\n\nProvide recommendations with priority levels and alternatives considered."
    },
    {
        "name": "Technical Specification Template",
        "template": "Write a technical specification for {{}}.\n\nFollow this structure:\n\n1. Overview\n   - Problem statement\n   - Goals and non-goals\n   - Success metrics\n\n2. Requirements\n   - Functional requirements\n   - Non-functional requirements\n   - Constraints\n\n3. Proposed Solution\n   - Architecture diagram (text)\n   - Component descriptions\n   - Data flow\n   - API design\n   - Database schema\n\n4. Alternatives Considered\n   - Option A (pros/cons)\n   - Option B (pros/cons)\n   - Why chosen approach\n\n5. Implementation Plan\n   - Phases\n   - Dependencies\n   - Timeline\n\n6. Testing Strategy\n\n7. Rollout Plan\n\n8. Monitoring and Alerting\n\n9. Risks and Mitigations\n\n10. Open Questions\n\nTarget audience: {{}}"
    },
    {
        "name": "Legacy System Modernization",
        "template": "Create a modernization strategy for {{}} legacy system.\n\nCurrent tech: {{}}\nAge: {{}} years\nPain points: {{}}\n\nProvide:\n1. Current state assessment\n2. Target architecture vision\n3. Migration strategies considered\n4. Recommended approach with rationale\n5. Phase breakdown\n6. Quick wins (6 months)\n7. Medium-term goals (12-18 months)\n8. Long-term vision (24+ months)\n9. Risk mitigation\n10. Team upskilling plan\n11. Testing strategy during migration\n12. Parallel run approach\n13. Cutover criteria\n14. Success metrics\n15. Budget estimation\n\nInclude specific technology recommendations."
    }
];

    // Utility Functions
    function countPlaceholders(str) {
        const matches = str.match(/\{\{\}\}/g);
        return matches ? matches.length : 0;
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

    // Remove all input fields
    function removeAllInputs() {
        while (inputsContainer.firstChild) {
            inputsContainer.removeChild(inputsContainer.firstChild);
        }
    }

    // Create input fields exactly matching placeholder count
    function createInputsForPlaceholders(count) {
        removeAllInputs();
        
        for (let i = 0; i < count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';

            const badge = document.createElement('span');
            badge.className = 'input-hint';
            badge.textContent = i + 1;

            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.placeholder = 'value for placeholder...';

            wrapper.appendChild(badge);
            wrapper.appendChild(newInput);
            inputsContainer.appendChild(wrapper);
        }
        
        refreshInputBadges();
        updateStats();
    }

    // Core Functions
    function addInputField() {
        // Maintain exact match - sync instead of adding
        syncInputsToTemplate();
    }

    function syncInputsToTemplate() {
        const phCount = countPlaceholders(templateArea.value);
        createInputsForPlaceholders(phCount);
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
        // Clear dropdown
        dropdown.innerHTML = '';
        
        // Add hardcoded prompts as options
        hardcodedPrompts.forEach((prompt, index) => {
            const option = document.createElement('option');
            option.value = prompt.template;
            option.textContent = prompt.name;
            dropdown.appendChild(option);
        });
        
        // Select the first option by default
        dropdown.selectedIndex = 0;
        
        // Load the first template
        templateArea.value = hardcodedPrompts[0].template;
    }

    function initialize() {
        // Initialize dropdown first (this sets the template)
        initializeDropdown();
        
        // Create inputs matching placeholders
        syncInputsToTemplate();
        
        // Generate initial prompt
        generatePrompt();
    }

    // Event Listeners
    templateArea.addEventListener('input', function() {
        syncInputsToTemplate();
        generatePrompt();
    });

    // Expose functions to global scope
    window.addInputField = addInputField;
    window.syncInputsToTemplate = syncInputsToTemplate;
    window.generatePrompt = generatePrompt;
    window.loadSelectedPrompt = loadSelectedPrompt;

    // Initialize everything
    initialize();
})();