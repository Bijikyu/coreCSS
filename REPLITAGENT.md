# CONSTRAINTS:

Module System Restrictions
I don't want to use any ES Modules. Do not try to implement p-limit; do not use it.

Binary Files & Images
Do not create binary files, or attempt to optimize images.

You will not ever use JQuery.


# POLICY:

Source of Truth & Code Alignment
The sources or truth go as follows external API docs > back end code > front end code > readmes and native documentation. This means you change back end code to fit external APIs if we use them since we can't change someone else's API. It also means we change front end code to fit the backend, NOT changing back end code to fit the front end. It also means we change readmes and documentation about our app to fit the front end and back end, NOT the other way around.

Task Assignment & Parallel Work
When making coding tasks, be sure that each task you assign in parallel is to discrete areas of non-overlapping code, so as to avoid merge conflicts in pull requests made in parallel.

Changes and New Code
If you make a change, comment it per guidelines, and if the change necessitates writing a new test, write it. Double check your work for bugs. Write code that is prepared for scaling users and is performative and secure.

Front end
All forms must validate inputs client- and server-side. All interactive elements must be accessible (WCAG 2.1 AA). All UI should be with UX/UI best practices.

Dependency & Module Error Reporting
In your notes responses, if tests or the app fails due to a missing module/s always state which module/s are missing.

Commenting & Documentation
Comment everything. This code will be read and analyzed by other developers and LLMs that are not as smart as you and will not likely understand your reason for making code as it is - you must explain not just the function but the rationale of the code. Do not delete comments as you edit code, but you may mutate their content to become relevant to the new code context. Ignore TODO comments, don't comment them or change them. I prefer comments that explain a single line of code in the same line (after the code), rather than above the line. Never comment JSON.

You will always comment code that has changed with the rationale for the code and its functionality to the right of each changed code line with what you changed. Make sure that's actually a comment and not some code ruining text. Obviously use js comment style for js, use python's comment style for python, html comment style for html, etc.

Helpers & Utilities
Helper functions should not be made to assist only a single function; leave such code in its function. Helper functions should only be made to assist more than one function. I prefer helper functions in the same file as the functions that uses them if they only assist functions in a single file (not in utility files). However such functions that could assist and centralize code across multiple files should be made into utilities. In summary: code that helps one function = in that function, code that helps 2+ functions in 1 file = helper function, code that helps 2+ functions in 2+ files = utility. For any utility consider if there is an existing (npm/node or python, depending on context) module we should use instead. When making helpers or utilities or making code dryer, don't make code to simply wrap a commonly called function, that is stupid... a simple call to a function does not need to be made dryer.

Code Structure & Organization
Use MVC architecture and best practice routing.
Handle req, res & next in the control functions, not the routes or services.

Module & Library Preferences
I prefer axios to node fetch, use that always. I prefer isomorphic-git to simple-git, use that always.

Routing & Endpoint Rules
I do not want you to ever trim routing just because it isn't used. I do not want you to ever trim functions just because there is no route to them or they are unused. I do not want you to rename routes URIs. Do not rename endpoints.

Node Modules Handling
Ignore the contents of the node_modules folder when it comes to instructions to alter code in the app. You must never alter code in the node modules folder. Do not add node_modules folder to .gitignore.

Dependency Utilization & Duplication
Use the module dependencies if they are useful! You do not have to go out of your way to use them, but don't duplicate module functionality - if a (npm/python) module provides functionality use that to keep our code dry.

Code Writing Preferences
I like all module exports at the bottom of a file, separate from the function definitions. I like functions declared via function declaration. I like code single line per functional operation to aid debugging: for instance an if statement with a single operation can be one line, while its else operation can all be on 2nd line, such as: if ( singleOperation ){ oneLine } else { twoLines }; Ignore this for ternary operations. Make code with try/catch set up for error handling where applicable. Always make coded functions with at least these two console.logs:

console.log(functionName is running with ${parameter/s} as the first line below the function declaration before the start of the try/catch block

console.log(functionName is returning ${thingBeingReturned} as the last line before a return in the try block, or if there is no return, console.log(functionName has run resulting in a final value of ${finalCalculatedValue}) as last line.

Change console log to make sense in context. Strings in javascript will be written with ` as opposed to ' or ", this is so it is easier to extend them later as string literals, do this unless there's a reason not to. When writing code or functions to interact with an API you will write as generic as possible to be able to accept different parameters which enable all functions for use with a given endpoint. With backend, if and only if it is a node app, error logging is done via qerrors module, so that it is: qerrors(error, 'error context', req, res, next);, if it is not an express req/res function use qerrors(error, 'error context', {params}); Obviously python apps and statis sites don't use this. When writing/refactoring code, prefer the smallest practical number of lines, combining similar branches with concise checks (e.g., using includes() where sensible). Avoid excessive helpers unless they remove repetition. Keep functionality in a single function if possible, & unify success/failure logic within a single block rather than duplicating it. Code should otherwise be as DRY as possible.

Naming Conventions
Function & variable names should be no more than two words combined to describe their use; if one or both words can be abbreviated do so, & use js camelCase ( a directory array variable could be "dirArr"). A function's name should consist of an action & a noun, action first, to say what it does, not what it is a doer of, so in example: "sendEmail", not "emailSender". A variable's name should consist of two relevant words, the first describing context of use, & the second what it is.

Assume app will be deployed to replit, render, netlify.

