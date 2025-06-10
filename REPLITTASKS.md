This is a list of prompts I need you to iterate through starting with #1. When #1 is done proceed to the next, or if you need me to prompt you, if I say “next” continue to the next task. Do each of the 45 prompt tasks strictly in order.

1) Write an AGENTS.md file for this codebase using the following section headings, in order: VISION, FUNCTIONALITY, SCOPE, CONSTRAINTS, POLICY. Only include information that cannot be reliably inferred from the code, file structure, configuration files, or existing documentation. For VISION, describe the project's context, intent, and the business logic or rationale behind important design choices that aren’t explained elsewhere. For FUNCTIONALITY, provide guidance for AI agents (including prompts, system instructions, boundaries, and expected behaviors) that are not found in agent configuration files. For SCOPE, define what is in-scope and out-of-scope for this codebase, clarify the boundaries for contributors and agents, and specify what types of changes are or are not permitted. For CONSTRAINTS, list files, folders, or components that must not be changed or require special process or approval, and call out any exceptions to standard workflow. For POLICY, document any organizational, legal, or workflow policies, custom pull request, commit, or CI/CD requirements, best practices, and “tribal knowledge” not otherwise documented. Present the AGENTS.md in clear Markdown using these section headings, and include only content that would not be obvious to an LLM reading the repo. If a section has nothing to add, leave only the heading with a note such as “No undocumented items.” Do not include generic templates or placeholders—write only what’s true for this repo. Do not repeat information that is already in the code, configuration, or other documentation. Contingent policies to include: if and only if it is a react app, use React hooks instead of class components, keep business logic out of react components - using services or hooks, and don't mutate state directly.


2) Revisit the prior task, improving upon your previous work making sure it is complete..


3) Analyze all utilities and services defined in the project and in identifying their purpose and functionality, search for well-maintained, reputable npm modules that accomplish equivalent or similar functionality.Focus on method-by-method or behavior-based comparison, not just similar names. Avoid false recommendations by requiring security, popularity, and maintenance analysis. If the module has significant tradeoffs (e.g. bundle size, open issues), do not recommend it. For each utility or service, provide the name and description of the closest npm module(s), including similarities and differences in functionality, performance, and flexibility. Indicate whether the npm module introduces external dependencies or architectural changes. Explicitly mention if functionality is only partially matched or if the npm module is less flexible or heavier. Assess security implications or risk (e.g., open CVEs or audit flags). Clearly state whether the custom utility/service should be replaced with the npm module and provide reasons for your recommendation.


4) Revisit the prior task, improving upon your previous work making sure it is complete..


5) "This next set of tasks is to comment the entire codebase. This code will be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may update their content to become relevant to the new code context. Comment all code comprehensively. Every function, class, and critical logic block must include comments that explain both what the code does and why it has been written that way. Your rationale is as important as the functionality—future readers, including developers and less capable LLMs, may not infer your intent without explicit explanation. Within a function you may comment inline or at a maximum put 1 comment between lines of code; multiple lines of code within a function makes it unreadable to a human. Most multi-line commenting should be outside the functions.
 Do not delete existing comments during edits. Instead, revise them to remain accurate and relevant in the new context. Maintain consistency in style and format.
 Comments should:
 Explain what the code does (technical function)
 Explain why it is implemented this way (rationale, tradeoffs, assumptions, edge cases)
 Highlight any non-obvious decisions or alternative paths considered
 Write comments as if your audience is someone competent but unfamiliar with your reasoning, and ensure they can maintain or improve the code without guessing. Examine pre-existing comments, if they can be improved upon toward these ends, you may expand upon them. DURING YOUR COMMENTING DO NOT ALTER THE CODE. DO NOT COMMENT JSON OR TYPESCRIPT FILES. DO NOT USE JS STYLE COMMENTING IN HTML or CSS."


6) Revisit the prior task, improving upon your previous work making sure it is complete..


7) Examine this code and determine if its implementation of all external APIs is both compliant with their documentation/specification and functionally correct. Identify any deviations, mistakes, or risks. List specific issues and explain how to fix them. If compliant, briefly summarize why.


8) Revisit the prior task, improving upon your previous work making sure it is complete..


9) Review the entire front-end codebase and backend/API specification for this project, ensuring that each UI element in the front end is correctly wired to the backend endpoint or handler that fulfills its functionality, with proper routing and data flow, and that each UI element is fully functional with a live connection and real effect on the backend or relevant external API. Identify and list any UI elements that do not call any backend or external API, explaining why if any exist. For each backend route or API endpoint, confirm there is a corresponding UI element that exposes or uses this functionality and flag any backend endpoints not accessible via the front end. For UI elements that call external APIs directly, check that these calls are functional, use the correct request structure, properly handle responses and errors, and are integrated with the app’s data flow. Finally, suggest concrete fixes as tasks that for any issues found. Each task should address an independent area of the code so as to avoid merge conflicts in pull requests.


10) Revisit the prior task, improving upon your previous work making sure it is complete..


11) Please thoroughly review the provided user interface and determine if it adheres to established UX and UI best practices, ensuring that all labels, buttons, and icons are clear and unambiguous, the layout and navigation are organized intuitively around the user's workflow and core tasks, similar elements and behaviors remain consistent throughout, and the design is free of unnecessary clutter. Assess whether the interface provides timely and clear feedback for user actions, and adapts responsively across device sizes. Evaluate if potential user errors are prevented or easy to recover from, and for each area where improvements are possible, take actionable referencing standard UX guidelines or heuristics where appropriate.


12) Revisit the prior task, improving upon your previous work making sure it is complete..


13) "This next set of tasks is to comment the entire codebase. This code will be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may update their content to become relevant to the new code context. Comment all code comprehensively. Every function, class, and critical logic block must include comments that explain both what the code does and why it has been written that way. Your rationale is as important as the functionality—future readers, including developers and less capable LLMs, may not infer your intent without explicit explanation. Within a function you may comment inline or at a maximum put 1 comment between lines of code; multiple lines of code within a function makes it unreadable to a human. Most multi-line commenting should be outside the functions.
 Do not delete existing comments during edits. Instead, revise them to remain accurate and relevant in the new context. Maintain consistency in style and format.
 Comments should:
 Explain what the code does (technical function)
 Explain why it is implemented this way (rationale, tradeoffs, assumptions, edge cases)
 Highlight any non-obvious decisions or alternative paths considered
 Write comments as if your audience is someone competent but unfamiliar with your reasoning, and ensure they can maintain or improve the code without guessing. Examine pre-existing comments, if they can be improved upon toward these ends, you may expand upon them. DURING YOUR COMMENTING DO NOT ALTER THE CODE. DO NOT COMMENT JSON OR TYPESCRIPT FILES. DO NOT USE JS STYLE COMMENTING IN HTML or CSS."


14) Revisit the prior task, improving upon your previous work making sure it is complete..


15) Write comprehensive unit tests for all functions and classes in this project. Write integration tests to cover the main workflows and critical interactions between modules in this app. Add tests for all endpoints in this API, including normal and error cases. Generate both unit and integration tests for the entire application. The code should be set up so that tests never start the server more than once.


16) Revisit the prior task, improving upon your previous work making sure it is complete..


17) You are an expert code reviewer. Your task is to examine the following codebase and identify possible bugs, logic errors, or potential issues. Only identify real bugs, not stylistic or opinion-based issues. Prioritize things that are faulty logic, or will cause undefined behavior and/or errors. Assign these to tasks to correct these found problems.


18) Revisit the prior task, improving upon your previous work making sure it is complete..


19) "This next set of tasks is to comment the entire codebase. This code will be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may update their content to become relevant to the new code context. Comment all code comprehensively. Every function, class, and critical logic block must include comments that explain both what the code does and why it has been written that way. Your rationale is as important as the functionality—future readers, including developers and less capable LLMs, may not infer your intent without explicit explanation. Within a function you may comment inline or at a maximum put 1 comment between lines of code; multiple lines of code within a function makes it unreadable to a human. Most multi-line commenting should be outside the functions.
 Do not delete existing comments during edits. Instead, revise them to remain accurate and relevant in the new context. Maintain consistency in style and format.
 Comments should:
 Explain what the code does (technical function)
 Explain why it is implemented this way (rationale, tradeoffs, assumptions, edge cases)
 Highlight any non-obvious decisions or alternative paths considered
 Write comments as if your audience is someone competent but unfamiliar with your reasoning, and ensure they can maintain or improve the code without guessing. Examine pre-existing comments, if they can be improved upon toward these ends, you may expand upon them. DURING YOUR COMMENTING DO NOT ALTER THE CODE. DO NOT COMMENT JSON OR TYPESCRIPT FILES. DO NOT USE JS STYLE COMMENTING IN HTML or CSS."


20) Revisit the prior task, improving upon your previous work making sure it is complete..


21) Instructions: Review Changes: Identify all recent changes in the codebase, including new features, modified APIs, updated usage patterns, or breaking changes that are not reflected in documentation or README.md. Update Documentation: Revise the main README file so that it accurately reflects the app’s current state, setup, and usage. If the codebase includes dedicated documentation pages (e.g., /docs, Markdown files, or Wiki pages), update only those sections affected by changes. Do not generate or modify unrelated documentation. If demo/test pages exist that are meant to showcase or exercise documented functionality, update them only as needed so they remain accurate with respect to both the code and the documentation. Scope Control: Do not create new documentation files unless a required doc for a major new feature is missing. Do not make changes to files unrelated to documentation, such as source code, config, or unrelated assets. Preserve formatting, style, and any conventions used in the project. Pitfalls to Avoid: Do not invent undocumented features, usage, or APIs. Avoid rewriting large parts of docs that are unrelated to recent code changes. Never delete or radically alter documentation unless those parts are no longer accurate due to code changes. Do not touch files outside documentation or demo/test directories/views. Always prefer minimal, targeted changes over broad rewrites.


22) Revisit the prior task, improving upon your previous work making sure it is complete..


23) "Go through codebase and find where similar code is rewritten and used by multiple functions and files. I need you to turn repeated code into common helper functions and utility files. For each thing you find suggest it as a task that touches separate code; I do not want my tasks to work on the same code correction areas as I don't want merge conflicts. Remember my advice on this: Helpers & Utilities: Helper functions should not be made to assist only a single function; leave such code in its function. Helper functions should only be made to assist more than one function. I prefer helper functions in the same file as the functions that uses them if they only assist functions in a single file (not in utility files). However such functions that could assist and centralize code across multiple files should be made into utilities. In summary: code that helps one function = in that function, code that helps 2+ functions in 1 file = helper function, code that helps 2+ functions in 2+ files = utility. For any utility consider if there is an existing (npm/node or python, depending on context) module we should use instead."


24) Revisit the prior task, improving upon your previous work making sure it is complete..


25) Please refactor the following code to make it DRY ("Don't Repeat Yourself"), but avoid over-abstracting or combining unrelated logic. Each function should have a single clear responsibility, and the code must remain easy to read and maintain. Do not remove any important comments, documentation, or handling for special/edge cases. Make sure to pass all required parameters, keep naming consistent, and explain any key changes made and why with comments. If code is duplicated intentionally for clarity, leave a comment explaining why, rather than merging it. For each thing you find to apply these instruction to, suggest it as a separate codex task that touches separate code; I do not want my tasks to work on the same code correction areas as I don't want merge conflicts.


26) Revisit the prior task, improving upon your previous work making sure it is complete..


27) "Go through codebase and find where similar code is rewritten and used by multiple functions and files. I need you to turn repeated code into common helper functions and utility files. For each thing you find suggest it as a task that touches separate code; I do not want my tasks to work on the same code correction areas as I don't want merge conflicts. Remember my advice on this: Helpers & Utilities: Helper functions should not be made to assist only a single function; leave such code in its function. Helper functions should only be made to assist more than one function. I prefer helper functions in the same file as the functions that uses them if they only assist functions in a single file (not in utility files). However such functions that could assist and centralize code across multiple files should be made into utilities. In summary: code that helps one function = in that function, code that helps 2+ functions in 1 file = helper function, code that helps 2+ functions in 2+ files = utility. For any utility consider if there is an existing (npm/node or python, depending on context) module we should use instead."


28) Revisit the prior task, improving upon your previous work making sure it is complete..


29) Review all helper functions and utility code in this app. Identify any functions or utilities that are sufficiently generic, broadly applicable, and decoupled from app-specific logic, such that they could be converted into npm modules for reuse across multiple projects. For each candidate, briefly justify your reasoning, and specify the suggested npm module name and its purpose. Do not include functions that are too specific to this app’s domain, rely heavily on app context, or would not offer clear value outside this project. I will need an in-depth explanation of what each of the suggested npm modules will do.


30) Revisit the prior task, improving upon your previous work making sure it is complete..


31) Analyze all utilities and services defined in the project and in identifying their purpose and functionality, search for well-maintained, reputable npm modules that accomplish equivalent or similar functionality.Focus on method-by-method or behavior-based comparison, not just similar names. Avoid false recommendations by requiring security, popularity, and maintenance analysis. If the module has significant tradeoffs (e.g. bundle size, open issues), do not recommend it. For each utility or service, provide the name and description of the closest npm module(s), including similarities and differences in functionality, performance, and flexibility. Indicate whether the npm module introduces external dependencies or architectural changes. Explicitly mention if functionality is only partially matched or if the npm module is less flexible or heavier. Assess security implications or risk (e.g., open CVEs or audit flags). Clearly state whether the custom utility/service should be replaced with the npm module and provide reasons for your recommendation.


32) Revisit the prior task, improving upon your previous work making sure it is complete..


33) Identify all dependencies, including libraries, frameworks, and packages, used in the app, whether they appear in configuration files such as package.json, requirements.txt, pom.xml, or are directly imported in the code; check for outdated, deprecated, or insecure dependencies and suggest appropriate updates or replacements; recommend best practices for managing these dependencies, such as using a lock file, semantic versioning, or a dependency update tool; list any unused or unnecessary dependencies that can be safely removed; and, if relevant, provide the exact commands or steps I should take to update, remove, or otherwise manage my dependencies. Also make sure we are making use of our existing dependencies instead of custom code where that is possible and makes sense.


34) Revisit the prior task, improving upon your previous work making sure it is complete..


35) "This next set of tasks is to comment the entire codebase. This code will be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may update their content to become relevant to the new code context. Comment all code comprehensively. Every function, class, and critical logic block must include comments that explain both what the code does and why it has been written that way. Your rationale is as important as the functionality—future readers, including developers and less capable LLMs, may not infer your intent without explicit explanation. Within a function you may comment inline or at a maximum put 1 comment between lines of code; multiple lines of code within a function makes it unreadable to a human. Most multi-line commenting should be outside the functions.
 Do not delete existing comments during edits. Instead, revise them to remain accurate and relevant in the new context. Maintain consistency in style and format.
 Comments should:
 Explain what the code does (technical function)
 Explain why it is implemented this way (rationale, tradeoffs, assumptions, edge cases)
 Highlight any non-obvious decisions or alternative paths considered
 Write comments as if your audience is someone competent but unfamiliar with your reasoning, and ensure they can maintain or improve the code without guessing. Examine pre-existing comments, if they can be improved upon toward these ends, you may expand upon them. DURING YOUR COMMENTING DO NOT ALTER THE CODE. DO NOT COMMENT JSON OR TYPESCRIPT FILES. DO NOT USE JS STYLE COMMENTING IN HTML or CSS."


36) Revisit the prior task, improving upon your previous work making sure it is complete..


37) Write comprehensive unit tests for all functions and classes in this project. Write integration tests to cover the main workflows and critical interactions between modules in this app. Add tests for all endpoints in this API, including normal and error cases. Generate both unit and integration tests for the entire application. The code should be set up so that tests never start the server more than once.


38) Revisit the prior task, improving upon your previous work making sure it is complete..


39) You are an expert code reviewer. Your task is to examine the following codebase and identify possible bugs, logic errors, or potential issues. Only identify real bugs, not stylistic or opinion-based issues. Prioritize things that are faulty logic, or will cause undefined behavior and/or errors. Assign these to tasks to correct these found problems.


40) Revisit the prior task, improving upon your previous work making sure it is complete..


41) "This next set of tasks is to comment the entire codebase. This code will
be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may update their content to become relevant to the new code context. Comment all code comprehensively. Every function, class, and critical logic block must include comments that explain both what the code does and why it has been written that way. Your rationale is as important as the functionality—future readers, including developers and less capable LLMs, may not infer your intent without explicit explanation. Within a function you may comment inline or at a maximum put 1 comment between lines of code; multiple lines of code within a function makes it unreadable to a human. Most multi-line commenting should be outside the functions.
 Do not delete existing comments during edits. Instead, revise them to remain accurate and relevant in the new context. Maintain consistency in style and format.
 Comments should:
 Explain what the code does (technical function)
 Explain why it is implemented this way (rationale, tradeoffs, assumptions, edge cases)
 Highlight any non-obvious decisions or alternative paths considered
 Write comments as if your audience is someone competent but unfamiliar with your reasoning, and ensure they can maintain or improve the code without guessing. Examine pre-existing comments, if they can be improved upon toward these ends, you may expand upon them. DURING YOUR COMMENTING DO NOT ALTER THE CODE. DO NOT COMMENT JSON OR TYPESCRIPT FILES. DO NOT USE JS STYLE COMMENTING IN HTML or CSS."
42) Revisit the prior task, improving upon your previous work making sure it is complete..


43) Instructions: Review Changes: Identify all recent changes in the codebase, including new features, modified APIs, updated usage patterns, or breaking changes that are not reflected in documentation or README.md. Update Documentation: Revise the main README file so that it accurately reflects the app’s current state, setup, and usage. If the codebase includes dedicated documentation pages (e.g., /docs, Markdown files, or Wiki pages), update only those sections affected by changes. Do not generate or modify unrelated documentation. If demo/test pages exist that are meant to showcase or exercise documented functionality, update them only as needed so they remain accurate with respect to both the code and the documentation. Scope Control: Do not create new documentation files unless a required doc for a major new feature is missing. Do not make changes to files unrelated to documentation, such as source code, config, or unrelated assets. Preserve formatting, style, and any conventions used in the project. Pitfalls to Avoid: Do not invent undocumented features, usage, or APIs. Avoid rewriting large parts of docs that are unrelated to recent code changes. Never delete or radically alter documentation unless those parts are no longer accurate due to code changes. Do not touch files outside documentation or demo/test directories/views. Always prefer minimal, targeted changes over broad rewrites.


44) Revisit the prior task, improving upon your previous work making sure it is complete.
45) State “ALL TASKS ARE COMPLETE”.



