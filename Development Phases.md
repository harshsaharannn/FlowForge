## Phase 1 — Project Foundation

First, we create the basic project structure and decide how the application will be organized.

We'll set up:

```
flowforge/
├── index.html
├── css/
├── js/
└── assets/
```

We'll also initialize Git and create the GitHub repository.

At this stage, we are **not building the workflow editor yet**. We're establishing the foundation so that as the project becomes more complex, we don't end up with one huge JavaScript file containing everything.

We'll decide how the JavaScript will eventually be separated into areas such as:

- State
- Canvas
- Nodes
- Connections
- Execution
- Validation
- Persistence

### What you'll learn

How to structure a non-trivial vanilla JavaScript application instead of putting everything into `script.js`.

### End result

A clean project that runs in the browser and is connected to Git.

---

# Phase 2 — Workflow State & Data Model

This is one of the **most important phases**.

Before we make the visual editor, we need to decide:

> **How does FlowForge actually remember what the user has built?**

This is where the term **workflow object** comes in.

A workflow object is simply a JavaScript object that represents the entire workflow in data.

Imagine the user has created:

```
Trigger → API Request → Output
```

The browser needs some way to remember:

- There are three nodes.
- What type each node is.
- Where each node is located.
- Which nodes are connected.
- What configuration each node has.

Instead of relying on the HTML elements themselves, we'll represent that information as JavaScript data.

Conceptually:

```
Workflow
│
├── Nodes
│   ├── Trigger
│   ├── API Request
│   └── Output
│
└── Connections
    ├── Trigger → API Request
    └── API Request → Output
```

The **workflow object** is therefore the application's source of truth.

We'll design the structure of:

### Workflow

Contains the overall workflow.

### Node

Represents an individual operation.

A node needs things such as:

```
ID
Type
Position
Configuration
```

For example, an API Request node needs to remember its URL and HTTP method.

### Connection

Represents the relationship between two nodes.

Conceptually:

```
source: API node
target: Output node
```

### What you'll learn

- How complex applications represent data.
- Objects containing arrays and nested objects.
- IDs and references.
- Why the DOM shouldn't be your database.
- How a visual interface can be represented entirely as JavaScript data.

### End result

You can create a workflow **as data**, even before we have a sophisticated visual editor.

---

# Phase 3 — Canvas & Node System

Now we turn that data into an actual visual editor.

We'll build the main FlowForge canvas where users construct workflows.

You'll be able to:

```
Node Library
     ↓
Add Node
     ↓
Node appears on Canvas
```

We'll implement the fundamental interactions:

- Add a node.
- Render a node.
- Select a node.
- Move a node.
- Delete a node.
- Track the node's position.

For example:

```
        Canvas

     ┌───────────┐
     │  Trigger  │
     └───────────┘

                 ┌─────────────┐
                 │ API Request │
                 └─────────────┘
```

When the user drags the API node, we don't simply move an HTML element.

We'll update its position in the workflow state:

```
User drags node
      ↓
Position changes
      ↓
Workflow state updated
      ↓
UI reflects new position
```

### What you'll learn

- DOM creation.
- Event handling.
- Drag interactions.
- Coordinates.
- State → UI relationships.
- Why application state matters.

### End result

You have a working visual node editor.

---

# Phase 4 — Connections & Graph

Now the nodes need to communicate with each other.

We'll build the connection system.

The user should be able to do something like:

```
Trigger
   │
   ▼
API Request
   │
   ▼
Output
```

Visually, we'll render connection lines between nodes.

Internally, however, the important thing is:

```
Node A → Node B
```

That relationship gets stored in the workflow state.

This is where FlowForge officially becomes a **graph editor**.

We'll deal with:

- Input handles.
- Output handles.
- Creating connections.
- Removing connections.
- Validating connections.
- Storing edges.
- Updating connection lines when nodes move.

We'll likely use SVG for the connection layer because the lines need to dynamically follow moving nodes.

### What you'll learn

- Graphs.
- Nodes and edges.
- References between objects.
- SVG.
- Coordinate calculations.
- How visual relationships map to data relationships.

### End result

Users can construct an actual directed graph visually.

---

# Phase 5 — Node Configuration

So far, nodes exist and connect, but they don't really **do** anything.

Now we give them configuration.

When the user selects a node, a configuration panel should appear.

For an API Request node:

```
API REQUEST

Method
[ GET ]

URL
[ https://api.example.com ]

Headers
[ + Add ]

Body
[ ... ]
```

For a Condition node:

```
CONDITION

Field
[ followers ]

Operator
[ greater than ]

Value
[ 100 ]
```

The important architectural part is that these settings don't just live inside the form.

They need to update the node's configuration inside the workflow state.

So:

```
User changes URL
       ↓
Configuration updated
       ↓
Node state updated
       ↓
Workflow state updated
```

### What you'll learn

- Form handling.
- Dynamic configuration.
- Updating nested objects.
- Keeping UI and state synchronized.
- Designing reusable node configuration systems.

### End result

Every node has a meaningful configuration that can later be used by the execution engine.

---

# Phase 6 — Workflow Validation

Before FlowForge executes anything, it needs to determine whether the workflow actually makes sense.

For example:

```
API Request
```

with no URL shouldn't be executable.

Similarly:

```
Condition
```

without a field or comparison value shouldn't be executable.

We'll create a validation system that checks the workflow before execution.

It might detect:

```
❌ No trigger found

❌ API Request URL is missing

❌ Condition is not configured

❌ Connection references a missing node
```

The important distinction is:

```
Validation
    ↓
Is this workflow valid?
```

versus:

```
Execution
    ↓
Actually run this workflow
```

These should be separate systems.

### What you'll learn

- Validation logic.
- Defensive programming.
- Separating responsibilities.
- Handling invalid application state.

### End result

FlowForge can determine whether a workflow is ready to execute.

---

# Phase 7 — Workflow Execution Engine

This is the **core engineering phase**.

Until now, we've been building the editor.

Now we build the thing that actually makes FlowForge a workflow automation tool.

The execution engine takes the workflow graph and runs it.

Conceptually:

```
Workflow
   ↓
Find Trigger
   ↓
Execute Trigger
   ↓
Find connected node
   ↓
Execute node
   ↓
Receive output
   ↓
Find next node
   ↓
Continue
```

The engine needs to understand the graph.

For example:

```
Trigger
   ↓
API Request
   ↓
Condition
   ├── TRUE → Transform
   │             ↓
   │           Output
   │
   └── FALSE → Output
```

The engine needs to know which path to take.

### What you'll learn

- Graph traversal.
- Algorithms.
- Execution flow.
- Passing data between functions.
- Separating execution from UI.
- Designing a small runtime.

### End result

A workflow created visually can actually **run as a program**.

---

# Phase 8 — Node Execution Handlers

Now we give each node its actual behavior.

Each node type needs to know what happens when the execution engine reaches it.

Conceptually:

```
Node
 ↓
Determine node type
 ↓
Run appropriate handler
```

The handlers will include:

```
Trigger Handler
API Request Handler
Condition Handler
Transform Handler
Output Handler
```

The API Request handler will actually perform HTTP requests.

The Condition handler will evaluate conditions.

The Transform handler will manipulate data.

The Output handler will expose the final result.

This is where your JavaScript knowledge starts coming together heavily.

### What you'll learn

- `fetch()`
- `async/await`
- Promises
- `try/catch`
- Objects
- Arrays
- Data transformation
- Asynchronous execution

### End result

The nodes aren't just UI components anymore. **They perform real operations.**

---

# Phase 9 — Execution State & Debugging

Now we need to show the user what is happening while the workflow runs.

When execution begins:

```
Trigger
   ↓
API Request
   ↓
Condition
   ↓
Transform
   ↓
Output
```

the UI should communicate the execution state.

For example:

```
✓ Trigger

✓ API Request

⟳ Condition

○ Transform

○ Output
```

Once execution completes:

```
✓ Trigger
✓ API Request
✓ Condition
✓ Transform
✓ Output
```

We'll track information such as:

```
Current node
Node status
Input
Output
Error
Execution duration
Overall workflow status
```

This becomes the **execution state**.

Remember:

```
Workflow State
=
What the workflow is

Execution State
=
What happened when it ran
```

They are different things.

### What you'll learn

- Runtime state.
- Status tracking.
- Debugging interfaces.
- Async UI updates.
- Separating persistent data from temporary execution data.

### End result

Users can see exactly what happened during a workflow execution.

---

# Phase 10 — Error Handling

Now we deliberately make FlowForge deal with things going wrong.

For example:

```
API Request
      ↓
Network failure
```

or:

```
API Request
      ↓
404 response
```

or:

```
Transform
      ↓
Expected property doesn't exist
```

Instead of the application crashing, we need controlled error handling.

The execution state should capture the failure:

```
Status: FAILED

Node: API Request

Error:
Request failed

Execution stopped.
```

We'll also distinguish between:

- Validation errors.
- Configuration errors.
- Runtime errors.
- Network errors.
- API errors.

### What you'll learn

- `try/catch`.
- Error propagation.
- Handling failed Promises.
- Designing useful error messages.
- Debugging asynchronous applications.

### End result

FlowForge fails gracefully and tells the user **why**.

---

# Phase 11 — Undo & Redo

Now we make the editor behave like a proper development tool.

Actions such as:

```
Add node
Move node
Delete node
Connect nodes
Disconnect nodes
Change configuration
```

should be reversible.

Conceptually:

```
State A
   ↓
State B
   ↓
State C
```

Press Undo:

```
State C
   ↓
State B
```

Press Undo again:

```
State B
   ↓
State A
```

We'll use a history system to keep track of workflow changes.

### What you'll learn

- State snapshots.
- History stacks.
- Reversible operations.
- Keyboard shortcuts.
- More advanced state management.

### End result

Users can safely experiment with workflows without permanently losing previous changes.

---

# Phase 12 — Persistence

Currently, refreshing the browser could destroy the workflow.

We need to fix that.

We'll save the workflow locally using `localStorage`.

The process is:

```
Workflow State
      ↓
Convert to JSON
      ↓
localStorage
```

When FlowForge starts:

```
localStorage
      ↓
Read JSON
      ↓
Convert back to JavaScript data
      ↓
Workflow State
      ↓
Render UI
```

This means the workflow survives a page refresh.

### What you'll learn

- JSON serialization.
- JSON parsing.
- `localStorage`.
- Persistence.
- Loading application state.

### End result

Your workflows persist between sessions.

---

# Phase 13 — Import & Export

Now we make workflows portable.

A user should be able to export their workflow:

```
Workflow
   ↓
JSON
   ↓
workflow.json
```

Then later import it:

```
workflow.json
   ↓
Parse JSON
   ↓
Validate workflow
   ↓
Load workflow state
   ↓
Render
```

This is also where we'll think about workflow versioning and ensuring that imported data isn't blindly trusted.

### What you'll learn

- File APIs.
- JSON.
- Serialization/deserialization.
- Data validation.
- Portable application state.

### End result

A FlowForge workflow can be saved as a file and moved between environments.

---

# Phase 14 — Canvas & UX Polish

Only after the core engineering works do we polish the editor.

We'll add things such as:

- Canvas zoom.
- Canvas panning.
- Better node interactions.
- Better connection interactions.
- Keyboard shortcuts.
- Improved empty states.
- Loading states.
- Error states.
- Better configuration panels.
- Execution animations.
- Selection states.
- Improved visual hierarchy.

The reason we're leaving this until later is simple:

**A beautiful workflow editor that doesn't actually work is a weak project.**

The engineering comes first. Polish comes after the system is reliable.

### What you'll learn

- More advanced interaction design.
- Coordinate transformations.
- UX states.
- Performance considerations.
- Refining an existing architecture instead of designing everything upfront.

### End result

FlowForge feels like an actual developer tool rather than a prototype.

---

# Phase 15 — Testing & Refactoring

Now we try to break our own application.

We'll test things like:

```
Can I create a node?

Can I delete it?

Can I move it?

Can I connect it?

Can I create an invalid connection?

Can I configure an API node?

Can I run the workflow?

What happens if the API fails?

What happens if a condition is false?

Does undo work?

Does refresh preserve the workflow?

Does import/export work?
```

We'll also inspect the architecture.

If we discover something like:

```
One file contains 1,500 lines
```

we don't simply accept it.

We'll determine what responsibilities should be separated.

### What you'll learn

- Debugging.
- Testing.
- Refactoring.
- Identifying architectural problems.
- Maintaining code quality.

### End result

A reliable application rather than a collection of features that happen to work.

---

# Phase 16 — GitHub & Portfolio Release

Finally, we turn the project into a proper GitHub project.

We'll clean up:

```
README.md
.gitignore
Project structure
Git history
Commit messages
Documentation
```

The README will explain:

### What FlowForge is

### Why it was built

### How the architecture works

### How workflows are represented

### How the execution engine works

### How nodes communicate

### How persistence works

### Technical challenges

### What was learned

### Known limitations

### Future improvements

We'll also create screenshots/GIFs showing the application working.

The Git history should show meaningful progress rather than:

```
final
final2
final-final
actual-final
please-work
```

Instead:

```
feat: initialize workflow editor
feat: add workflow state model
feat: implement draggable nodes
feat: add graph connections
feat: implement node configuration
feat: add workflow validation
feat: implement execution engine
feat: add API request handler
feat: add execution tracking
feat: implement workflow persistence
feat: add undo and redo
docs: document FlowForge architecture
```

### End result

A GitHub repository that demonstrates **actual frontend engineering and JavaScript architecture**, not just another CRUD or API project.

---

# The Complete Development Path

```
PHASE 1
Project Foundation
        ↓
PHASE 2
Workflow State & Data Model
        ↓
PHASE 3
Canvas & Node System
        ↓
PHASE 4
Connections & Graph
        ↓
PHASE 5
Node Configuration
        ↓
PHASE 6
Workflow Validation
        ↓
PHASE 7
Execution Engine
        ↓
PHASE 8
Node Execution Handlers
        ↓
PHASE 9
Execution State & Debugging
        ↓
PHASE 10
Error Handling
        ↓
PHASE 11
Undo & Redo
        ↓
PHASE 12
Persistence
        ↓
PHASE 13
Import & Export
        ↓
PHASE 14
UX & Canvas Polish
        ↓
PHASE 15
Testing & Refactoring
        ↓
PHASE 16
GitHub & Portfolio Release
```

### The most important architectural progression

You should understand FlowForge as **four layers being built on top of each other**:

```
              ┌─────────────────────┐
              │       UI / UX       │
              │ Canvas, Nodes, etc. │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │   WORKFLOW STATE    │
              │ Nodes + Connections │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │   WORKFLOW GRAPH    │
              │  Execution paths    │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │  EXECUTION ENGINE   │
              │ Execute + Data Flow │
              └─────────────────────┘
```

**That's the architecture I want you to understand while building this.** We're not going to blindly follow tutorials and paste code. At every phase, I'll explain **what problem we're solving, what data we need, how the pieces communicate, and why we're structuring it that way** before you write the implementation.