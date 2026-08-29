
**FlowForge is a visual workflow automation builder that lets users create and execute small automated processes by connecting functional nodes together instead of writing the entire process manually in code.**

The core idea is simple:

> **You visually build a program, and FlowForge turns that visual structure into executable logic.**

A user can create a workflow such as:

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

Each block represents an operation. The connections determine **what happens next**.

---

## What are we actually building?

We're building a **mini version of tools like n8n/Zapier's workflow builder**, but much smaller and intentionally implemented from scratch in JavaScript.

The user opens FlowForge and gets a visual workspace.

On the left, there is a library of available nodes:

```
┌─────────────────┐
│  NODE LIBRARY   │
│                 │
│  + Trigger      │
│  + API Request  │
│  + Condition    │
│  + Transform    │
│  + Output       │
└─────────────────┘
```

The main area is the workflow canvas:

```
┌──────────────────────────────────────────────┐
│                                              │
│       ┌────────────┐                         │
│       │  Trigger   │                         │
│       └─────┬──────┘                         │
│             │                                │
│             ▼                                │
│       ┌────────────┐                         │
│       │ API Request│                         │
│       └─────┬──────┘                         │
│             │                                │
│             ▼                                │
│       ┌────────────┐                         │
│       │ Condition  │                         │
│       └─────┬──────┘                         │
│             │                                │
│             ▼                                │
│       ┌────────────┐                         │
│       │   Output   │                         │
│       └────────────┘                         │
│                                              │
└──────────────────────────────────────────────┘
```

The user can drag nodes around, connect them, configure them, and run the workflow.

---

# What does a workflow actually do?

Let's take a concrete example.

Suppose I want FlowForge to:

> Get information about a GitHub user, check whether they have more than 100 followers, transform the data, and display the result.

The workflow could be:

```
Manual Trigger
      ↓
GET GitHub User
      ↓
followers > 100?
     /       \
   YES        NO
    ↓          ↓
Transform     Output
    ↓
 Output
```

When the user presses **Run**, FlowForge actually performs the operations.

It doesn't just animate the boxes.

It executes them.

---

# The five fundamental node types

### 1. Trigger

The trigger starts the workflow.

For our first version, this will simply be a **manual trigger**.

The user clicks:

```
▶ Run Workflow
```

and execution begins at the trigger.

Later, the architecture could support things like:

```
Webhook
Schedule
Timer
Event
```

but those aren't necessary for v1.

---

### 2. API Request

This node communicates with an external API.

The user might configure:

```
API REQUEST

Method
GET

URL
https://api.github.com/users/octocat

Headers
...

Body
...
```

When the workflow reaches this node, FlowForge performs the HTTP request.

The API might return:

```
{
    "login": "octocat",
    "followers": 150,
    "public_repos": 8
}
```

That response becomes the input for the next node.

---

### 3. Condition

The condition node makes a decision based on the incoming data.

For example:

```
Field:
followers

Operator:
>

Value:
100
```

The API returned:

```
followers = 150
```

So FlowForge evaluates:

```
150 > 100
```

which produces:

```
TRUE
```

The workflow then follows the **true connection**.

This introduces branching.

---

### 4. Transform

The transform node modifies the data.

Suppose the API returned:

```
{
    "login": "octocat",
    "followers": 150,
    "public_repos": 8
}
```

The transform might produce:

```
{
    "username": "octocat",
    "followers": 150
}
```

So the node essentially acts as:

```
INPUT
  ↓
Transform
  ↓
OUTPUT
```

This is where you'll get a lot of practice with JavaScript objects, arrays, nested data and data manipulation.

---

### 5. Output

The output node displays or produces the final result.

For example:

```
WORKFLOW RESULT

{
    "username": "octocat",
    "followers": 150
}
```

---

# The important part: FlowForge isn't really about boxes

This is the part I want you to understand properly.

The boxes are just the **visual representation**.

Underneath the interface, FlowForge has a data structure representing the workflow.

Conceptually:

```
Workflow
│
├── Nodes
│   ├── Trigger
│   ├── API Request
│   ├── Condition
│   └── Output
│
└── Connections
    ├── Trigger → API
    ├── API → Condition
    └── Condition → Output
```

So when you drag an API node around, FlowForge isn't fundamentally changing a box.

It's changing the node's data.

When you connect two nodes, FlowForge isn't fundamentally drawing a line.

It's creating a relationship:

```
Node A → Node B
```

The line is simply the visual representation of that relationship.

---

# This means FlowForge is a graph editor

Technically, the workflow is a **directed graph**.

You have:

```
Nodes = vertices
Connections = directed edges
```

For example:

```
       A
       │
       ▼
       B
      / \
     ▼   ▼
    C     D
```

The graph is:

```
A → B
B → C
B → D
```

This is important because the execution engine needs to understand this graph.

It needs to determine:

> Where do I start?

> What node comes next?

> Which branch should I follow?

> What data should be passed forward?

> When is the workflow finished?

That's where the project becomes much more than DOM manipulation.

---

# FlowForge has two completely different sides

Think of the project as having a **builder** and a **runtime**.

## Builder

The builder is what the user interacts with.

It handles:

```
Create nodes
Move nodes
Delete nodes
Connect nodes
Configure nodes
Save workflow
Load workflow
Undo/redo
```

Essentially:

> **"What workflow did the user build?"**

---

## Runtime

The runtime actually executes the workflow.

It handles:

```
Validate workflow
Find trigger
Execute node
Pass data
Follow connections
Handle branches
Wait for async operations
Handle errors
Track execution
Produce result
```

Essentially:

> **"What happens when this workflow runs?"**

These two systems need to be separated.

That's one of the biggest architectural lessons of this project.

---

# Example of the complete lifecycle

Imagine the user creates:

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

### Step 1 — User builds it

FlowForge stores the nodes and connections.

### Step 2 — User configures API

They enter:

```
GET
https://example.com/users
```

That configuration becomes part of the API node's data.

### Step 3 — User presses Run

FlowForge takes the workflow.

### Step 4 — Validation

It checks:

```
Is there a trigger?
Does every node have valid configuration?
Do connections point to existing nodes?
Does the API have a URL?
Does the condition have a field?
```

If something is wrong:

```
❌ Workflow cannot run

API Request:
URL is required.
```

If everything is valid, execution starts.

### Step 5 — Execute

```
Trigger
   ↓
API Request
```

The API request happens asynchronously.

FlowForge waits for the response.

### Step 6 — Pass data

The response becomes input:

```
API
 ↓
response data
 ↓
Condition
```

### Step 7 — Evaluate

The condition decides which connection to follow.

### Step 8 — Continue

The selected branch executes.

### Step 9 — Finish

The output node produces the final result.

FlowForge can then show:

```
Execution complete

✓ Trigger       2ms
✓ API Request  248ms
✓ Condition     1ms
✓ Transform     2ms
✓ Output        1ms
```

---

# What happens if something fails?

Suppose the API returns:

```
404 Not Found
```

FlowForge shouldn't just crash.

It should record:

```
API Request

❌ Failed

HTTP Status: 404
Duration: 182ms
```

And the UI should visually indicate that the node failed.

That means we'll have **execution state** separate from the workflow itself.

For example:

```
Workflow State
────────────────
API node
URL = /users
position = x:500 y:300
```

versus:

```
Execution State
────────────────
API node
status = failed
statusCode = 404
duration = 182ms
```

The workflow hasn't changed.

Only its execution result has.

---

# What happens when the user moves a node?

Suppose the API node is here:

```
x: 500
y: 300
```

The user drags it.

Now:

```
x: 700
y: 400
```

The application updates the workflow state.

The UI then renders the node at the new position.

This gives us a fundamental architecture:

```
USER ACTION
     ↓
UPDATE STATE
     ↓
RENDER UI
```

Rather than:

```
USER ACTION
     ↓
DIRECTLY MANIPULATE RANDOM DOM ELEMENTS
```

That distinction is one of the main reasons this project will teach you proper frontend architecture.

---

# What the final application should allow

By the end of v1, a user should be able to:

**Build**

```
Drag node → position it → connect it
```

**Configure**

```
Select node → configure its properties
```

**Execute**

```
Press Run → workflow executes
```

**Inspect**

```
See node status
See inputs
See outputs
See errors
```

**Save**

```
Save workflow locally
```

**Import/export**

```
Workflow → JSON file
JSON file → Workflow
```

**Undo/redo**

```
Ctrl/Cmd + Z
Ctrl/Cmd + Shift + Z
```

---

# What the user should feel

The goal isn't for FlowForge to feel like a random JavaScript project.

It should feel like a **small developer tool**.

The experience should be:

> "I have an idea for a small automation. Instead of writing all the code manually, I'll construct it visually and run it."

That's the product.

---

# What FlowForge is NOT

We're deliberately not trying to compete with production tools like n8n.

We're not initially building:

```
Authentication
Teams
Billing
Cloud infrastructure
1000 integrations
Production webhooks
Distributed workers
Real-time collaboration
Enterprise permissions
```

Those would turn this into a completely different project.

Our target is:

> **A functioning local visual workflow editor + workflow execution engine.**

That is already enough to demonstrate substantial JavaScript engineering ability.

---

# The project at a technical level

If I reduce the entire project down to its engineering components:

```
                    FLOWFORGE
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
      UI               STATE           ENGINE
       │                │                │
       │                │                ├── Validation
       │                │                ├── Execution
       │                │                ├── Node handlers
       │                │                └── Error handling
       │                │
       ├── Canvas       ├── Nodes
       ├── Nodes        ├── Connections
       ├── Panels       ├── Configuration
       ├── Toolbar      └── History
       └── Execution
              │
              ▼
         Persistence
              │
        ┌─────┴─────┐
        ▼           ▼
   localStorage    JSON
```

And when execution reaches an API:

```
Workflow
   ↓
Execution Engine
   ↓
API Handler
   ↓
fetch()
   ↓
External API
   ↓
Response
   ↓
Execution Engine
   ↓
Next Node
```

That's the complete system in one picture.

---

# The core engineering problem

If I had to describe the **actual challenge** of FlowForge in one sentence:

> **We're building a system that converts a user-created visual graph into executable asynchronous JavaScript operations while keeping the UI, workflow state, and execution state synchronized.**

That is what makes this project worthwhile.

We're not just learning how to make draggable cards.

We're learning how to build a **small visual programming environment**.

And that's also why the original project description mentioned:

**nodes → connections → state → events → execution order → async execution → serialization → undo/redo.**

Those aren't random features. They're the different pieces required to make the visual editor actually behave like a program.

Next we will be discussing the phases for your project [[Development Phases]]
