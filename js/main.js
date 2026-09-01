// =========================
// PHASE 1 & 2
// =========================

const triggerNode = {
    id: "node-1",
    type: "trigger",
    position: {
        x: 100,
        y: 200
    },
    configuration: {}
};


const apiNode = {
    id: "node-2",
    type: "apiRequest",
    position: {
        x: 400,
        y: 200
    },
    configuration: {
        method: "GET",
        url: "https://example.com"
    }
};


const conditionNode = {
    id: "node-3",
    type: "condition",
    position: {
        x: 700,
        y: 200
    },
    configuration: {}
};


const transformNode = {
    id: "node-4",
    type: "transform",
    position: {
        x: 1000,
        y: 200
    },
    configuration: {}
};


const outputNode = {
    id: "node-5",
    type: "output",
    position: {
        x: 1300,
        y: 200
    },
    configuration: {}
};


// =========================
// CONNECTIONS
// =========================

const connection1 = {
    source: "node-1",
    target: "node-2"
};

const connection2 = {
    source: "node-2",
    target: "node-3"
};

const connection3 = {
    source: "node-3",
    target: "node-4"
};

const connection4 = {
    source: "node-4",
    target: "node-5"
};


// =========================
// WORKFLOW ARRAYS
// =========================

const nodes = [];

let connections = [];


// Add all 5 nodes

nodes.push(
    triggerNode,
    apiNode,
    conditionNode,
    transformNode,
    outputNode
);


// Add all connections

connections.push(
    connection1,
    connection2,
    connection3,
    connection4
);


// =========================
// UPDATE NODE
// =========================

const updatedNode = nodes.find(
    node => node.id === triggerNode.id
);

updatedNode.position.x = 100;
updatedNode.position.y = 200;


// =========================
// CREATE WORKFLOW
// =========================

const workflow = {
    nodes,
    connections
};


// =========================
// VALIDATE CONNECTIONS
// =========================

const isValid = connections.every(connection => {

    const sourceNode = nodes.find(node => {
        return node.id === connection.source;
    });

    const targetNode = nodes.find(node => {
        return node.id === connection.target;
    });

    return sourceNode && targetNode;
});


console.log(workflow);
console.log(isValid);


// =========================
// PHASE 3
// RENDER NODES
// =========================

const canvas = document.querySelector(".canvas");
const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
);svg.classList.add("connections");
canvas.append(svg)


nodes.forEach(node => {

    // =========================
    // CREATE NODE WRAPPER
    // =========================

    const nodeElement = document.createElement("div");

    nodeElement.id = node.id;

    nodeElement.classList.add("node");


    // =========================
    // POSITION NODE
    // =========================

    nodeElement.style.left =
        node.position.x + "px";

    nodeElement.style.top =
        node.position.y + "px";


    // =========================
    // CREATE CARD
    // =========================

    const nodeCard = document.createElement("div");

    nodeCard.classList.add("node-card");


    // =========================
    // CREATE ICON
    // =========================

    const nodeIcon = document.createElement("img");


    if (node.type === "trigger") {

        nodeIcon.src = "assets/Trigger.svg";

    }


    if (node.type === "apiRequest") {

        nodeIcon.src = "assets/API.svg";

    }


    if (node.type === "condition") {

        nodeIcon.src = "assets/Conditions.svg";

    }


    if (node.type === "transform") {

        nodeIcon.src = "assets/Transform.svg";

    }


    if (node.type === "output") {

        nodeIcon.src = "assets/Output.svg";

    }


    nodeIcon.alt = node.type;


    // Put icon inside card

    nodeCard.appendChild(nodeIcon);


    // =========================
    // CREATE LABEL
    // =========================

    const nodeLabel = document.createElement("div");

    nodeLabel.classList.add("node-label");

    nodeLabel.textContent = node.type;


    // =========================
    // CREATE INPUT HANDLE
    // =========================

// =========================
// CREATE HANDLES
// =========================

// Every node except Trigger needs an INPUT

if (node.type !== "trigger") {

    const inputHandle = document.createElement("div");

    inputHandle.classList.add(
        "handle",
        "input-handle"
    );

    nodeCard.appendChild(inputHandle);
}


// Every node except Output needs an OUTPUT

if (node.type !== "output") {

    const outputHandle = document.createElement("div");

    outputHandle.classList.add(
        "handle",
        "output-handle"
    );

    nodeCard.appendChild(outputHandle);
}

    // =========================
    // PUT CARD + LABEL
    // INSIDE NODE
    // =========================

    nodeElement.appendChild(nodeCard);

    nodeElement.appendChild(nodeLabel);


    // =========================
    // PUT NODE ON CANVAS
    // =========================

    canvas.appendChild(nodeElement);

});

// =========================
// GET CREATED NODES
// =========================

const nodeElement =
    document.querySelectorAll(".node");


// =========================
// DRAGGING VARIABLES
// =========================

let offsetX = 0;

let offsetY = 0;

let selectedNode = null;


// =========================
// MOUSE DOWN
// =========================

nodeElement.forEach(node => {

    node.addEventListener(
        "mousedown",
        event => {

            selectedNode = node;


            // Get node position
            // relative to browser

            const rect =
                node.getBoundingClientRect();


            // Remember where
            // inside the node
            // the mouse grabbed

            offsetX =
                event.clientX - rect.left;

            offsetY =
                event.clientY - rect.top;


            // Start listening
            // for mouse movement

            document.addEventListener(
                "mousemove",
                moveNode
            );

        }
    );


    // =========================
    // MOUSE UP
    // =========================

    document.addEventListener(
        "mouseup",
        () => {

            selectedNode = null;


            document.removeEventListener(
                "mousemove",
                moveNode
            );

        }
    );

});

// drawing the connection lines 
const sourceHandle = document.querySelector("#node-1 .output-handle");
const targetHandle = document.querySelector("#node-2 .input-handle")


const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
);

line.setAttribute("stroke" , "black");
line.setAttribute("stroke-width" , "2")

svg.appendChild(line);

 function updateConnection(){
    const sourceHandleRect = sourceHandle.getBoundingClientRect();
    const targetHandleRect = targetHandle.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const startX = sourceHandleRect.x - canvasRect.left + sourceHandleRect.width/2;
    const startY = sourceHandleRect.y - canvasRect.top + sourceHandleRect.height/2;

    const endX = targetHandleRect.x - canvasRect.left + targetHandleRect.width/2;
    const endY = targetHandleRect.y - canvasRect.top + targetHandleRect.height/2;

    line.setAttribute("x1" , startX);
    line.setAttribute("y1" , startY);

    line.setAttribute("x2" , endX);
    line.setAttribute("y2" , endY);
};

// =========================
// MOVE NODE
// =========================

function moveNode(event) {

    if (!selectedNode) return;


    // Get canvas position
    // relative to browser

    const canvasRect =
        canvas.getBoundingClientRect();


    // Calculate new X

    const newX =
        event.clientX
        - canvasRect.left
        - offsetX;


    // Calculate new Y

    const newY =
        event.clientY
        - canvasRect.top
        - offsetY;


    // =========================
    // MOVE VISUAL NODE
    // =========================

    selectedNode.style.left =
        newX + "px";

    selectedNode.style.top =
        newY + "px";


    // =========================
    // FIND NODE DATA
    // =========================

    const nodeData = nodes.find(node => {

        return node.id === selectedNode.id;

    });


    // =========================
    // UPDATE NODE DATA
    // =========================

    if (nodeData) {

        nodeData.position.x = newX;

        nodeData.position.y = newY;

    }
    updateConnection();
   
}