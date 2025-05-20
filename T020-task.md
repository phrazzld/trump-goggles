# Task ID: T020

# Title: Review and secure originalText handling for XSS

## Original Ticket Text

- [ ] **T020 · Fix · P2: review and secure originalText handling for XSS**

  - **Context:** PLAN.md, CR-09, Step 1-4
  - **Action:**
    1. Audit how `originalText` is sourced and used.
    2. Ensure textContent (not innerHTML) is used for display.
    3. Add sanitization for log output if needed.
  - **Done‑when:**
    1. No XSS vulnerabilities exist in originalText handling.
    2. Security considerations are documented.
  - **Depends‑on:** [T001]

## Implementation Approach Analysis Prompt

Please analyze how `originalText` is currently handled in the Trump Goggles extension and identify potential XSS vulnerabilities. This task requires:

1. A comprehensive audit of how originalText is sourced from the DOM
2. Analysis of how originalText is displayed or otherwise used throughout the codebase
3. Identification of any locations where innerHTML or other potentially unsafe DOM operations are used
4. Creation of a remediation plan to address any vulnerabilities

Focus on:
- Where originalText comes from (DOM attributes, text nodes, API responses, etc.)
- How it's stored (DOM attributes, JavaScript variables)
- How it's displayed (textContent vs innerHTML)
- How it's logged (potential security concerns with logging sensitive data)
- How it's sanitized (or needs to be sanitized)

Consider security best practices such as:
- Using textContent instead of innerHTML
- Sanitizing user-supplied content
- Escaping special characters in logs
- Avoiding dynamic script execution

The goal is to ensure that originalText handling is secure and resistant to XSS attacks.