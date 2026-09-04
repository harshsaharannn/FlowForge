// ========================================
// STATE
// ========================================

const nodes = [];

const connections = [];


let isConnecting = false;

let connectionSource = null;

let connectionSourceHandle = null;

let temporaryConnection = null;


// ========================================
// DOM ELEMENTS
// ========================================

const canvas =
    document.querySelector(".canvas");


const connectionsLayer =
    document.querySelector(".connections");


const libraryItems =
    document.querySelectorAll(".library-item");


// ========================================
// CREATE NODE
// ========================================

function createNode(type) {

    const node = {

        id:
            `node-${nodes.length + 1}`,

        type: type,

        position: {

            x:
                100 +
                (nodes.length * 180),

            y: 200
        },

        configuration: {}
    };


    return node;
}


// ========================================
// CREATE CURVED PATH
// ========================================

function createCurve(
    startX,
    startY,
    endX,
    endY
) {

    const distance =
        Math.abs(
            endX - startX
        );


    const curve =
        Math.max(
            60,
            distance * 0.5
        );


    const controlPoint1X =
        startX + curve;


    const controlPoint1Y =
        startY;


    const controlPoint2X =
        endX - curve;


    const controlPoint2Y =
        endY;


    return `
        M ${startX} ${startY}

        C
        ${controlPoint1X} ${controlPoint1Y},
        ${controlPoint2X} ${controlPoint2Y},
        ${endX} ${endY}
    `;
}


// ========================================
// RENDER NODE
// ========================================

function renderNode(node) {

    const nodeElement =
        document.createElement("div");


    nodeElement.classList.add(
        "node"
    );


    nodeElement.dataset.id =
        node.id;


    nodeElement.style.left =
        `${node.position.x}px`;


    nodeElement.style.top =
        `${node.position.y}px`;


    nodeElement.draggable =
        false;


    // ====================================
    // NODE CARD
    // ====================================

    const card =
        document.createElement("div");


    card.classList.add(
        "node-card"
    );


    card.draggable =
        false;


    // ====================================
    // ICON
    // ====================================

    const icon =
        document.createElement("img");


    icon.draggable =
        false;


    const iconNames = {

        trigger:
            "Trigger.svg",

        api:
            "API.svg",

        condition:
            "Conditions.svg",

        transform:
            "Transform.svg",

        output:
            "Output.svg"
    };


    icon.src =
        `assets/${iconNames[node.type]}`;


    icon.classList.add(
        "node-icon"
    );


    // ====================================
    // INPUT HANDLE
    // ====================================

    if (
        node.type !== "trigger"
    ) {

        const inputHandle =
            document.createElement("div");


        inputHandle.classList.add(
            "handle",
            "input-handle"
        );


        inputHandle.draggable =
            false;


        card.appendChild(
            inputHandle
        );
    }


    // ====================================
    // ICON
    // ====================================

    card.appendChild(
        icon
    );


    // ====================================
    // OUTPUT HANDLES
    // ====================================

    if (
        node.type === "condition"
    ) {


        // ==================================
        // IF OUTPUT
        // ==================================

        const ifHandle =
            document.createElement("div");


        ifHandle.classList.add(
            "handle",
            "output-handle",
            "condition-if-handle"
        );


        ifHandle.dataset.output =
            "if";


        ifHandle.draggable =
            false;


        setupOutputHandle(
            ifHandle,
            node,
            "if"
        );


        card.appendChild(
            ifHandle
        );


        // ==================================
        // ELSE OUTPUT
        // ==================================

        const elseHandle =
            document.createElement("div");


        elseHandle.classList.add(
            "handle",
            "output-handle",
            "condition-else-handle"
        );


        elseHandle.dataset.output =
            "else";


        elseHandle.draggable =
            false;


        setupOutputHandle(
            elseHandle,
            node,
            "else"
        );


        card.appendChild(
            elseHandle
        );
    }


    // ====================================
    // NORMAL OUTPUT
    // ====================================

    else if (
        node.type !== "output"
    ) {

        const outputHandle =
            document.createElement("div");


        outputHandle.classList.add(
            "handle",
            "output-handle"
        );


        outputHandle.dataset.output =
            "output";


        outputHandle.draggable =
            false;


        setupOutputHandle(
            outputHandle,
            node,
            "output"
        );


        card.appendChild(
            outputHandle
        );
    }


    // ====================================
    // LABEL
    // ====================================

    const label =
        document.createElement("span");


    label.textContent =
        node.type
            .charAt(0)
            .toUpperCase() +
        node.type.slice(1);


    label.classList.add(
        "node-label"
    );


    label.draggable =
        false;


    // ====================================
    // ADD CARD + LABEL
    // ====================================

    nodeElement.appendChild(
        card
    );


    nodeElement.appendChild(
        label
    );


    // ====================================
    // ADD NODE TO CANVAS
    // ====================================

    canvas.appendChild(
        nodeElement
    );


    // ====================================
    // MAKE NODE DRAGGABLE
    // ====================================

    makeNodeDraggable(
        nodeElement,
        node
    );
}


// ========================================
// SETUP OUTPUT HANDLE
// ========================================

function setupOutputHandle(
    outputHandle,
    node,
    outputType
) {

    outputHandle.addEventListener(
        "mousedown",
        event => {

            event.preventDefault();

            event.stopPropagation();


            // ==================================
            // START CONNECTION
            // ==================================

            isConnecting =
                true;


            connectionSource =
                node.id;


            connectionSourceHandle =
                outputType;


            // ==================================
            // GET HANDLE POSITION
            // ==================================

            const handleRect =
                outputHandle
                    .getBoundingClientRect();


            const canvasRect =
                canvas
                    .getBoundingClientRect();


            const startX =
                handleRect.left +
                handleRect.width / 2 -
                canvasRect.left;


            const startY =
                handleRect.top +
                handleRect.height / 2 -
                canvasRect.top;


            // ==================================
            // CREATE TEMPORARY CURVE
            // ==================================

            temporaryConnection =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );


            const pathData =
                createCurve(
                    startX,
                    startY,
                    startX,
                    startY
                );


            temporaryConnection.setAttribute(
                "d",
                pathData
            );


            temporaryConnection.setAttribute(
                "fill",
                "none"
            );


            temporaryConnection.setAttribute(
                "stroke",
                "#999"
            );


            temporaryConnection.setAttribute(
                "stroke-width",
                "2"
            );


            temporaryConnection.setAttribute(
                "stroke-linecap",
                "round"
            );


            connectionsLayer.appendChild(
                temporaryConnection
            );
        }
    );
}


// ========================================
// NODE DRAGGING
// ========================================

function makeNodeDraggable(
    nodeElement,
    node
) {

    let isDragging =
        false;


    let offsetX =
        0;


    let offsetY =
        0;


    // ====================================
    // MOUSE DOWN
    // ====================================

    nodeElement.addEventListener(
        "mousedown",
        event => {


            // Don't drag node when
            // clicking a handle.

            if (
                event.target.classList.contains(
                    "handle"
                )
            ) {

                return;
            }


            event.preventDefault();


            isDragging =
                true;


            const nodeRect =
                nodeElement
                    .getBoundingClientRect();


            offsetX =
                event.clientX -
                nodeRect.left;


            offsetY =
                event.clientY -
                nodeRect.top;


            nodeElement.style.cursor =
                "grabbing";
        }
    );


    // ====================================
    // MOUSE MOVE
    // ====================================

    document.addEventListener(
        "mousemove",
        event => {


            // ==================================
            // CONNECTION DRAGGING
            // ==================================

            if (
                isConnecting
            ) {

                const canvasRect =
                    canvas
                        .getBoundingClientRect();


                const mouseX =
                    event.clientX -
                    canvasRect.left;


                const mouseY =
                    event.clientY -
                    canvasRect.top;


                // Find source node

                const sourceNodeElement =
                    document.querySelector(
                        `[data-id="${connectionSource}"]`
                    );


                if (
                    !sourceNodeElement
                ) {

                    return;
                }


                // Find correct output handle

                const sourceOutputHandle =
                    getOutputHandle(
                        sourceNodeElement,
                        connectionSourceHandle
                    );


                if (
                    !sourceOutputHandle
                ) {

                    return;
                }


                // ==================================
                // GET START POSITION
                // ==================================

                const outputRect =
                    sourceOutputHandle
                        .getBoundingClientRect();


                const startX =
                    outputRect.left +
                    outputRect.width / 2 -
                    canvasRect.left;


                const startY =
                    outputRect.top +
                    outputRect.height / 2 -
                    canvasRect.top;


                // ==================================
                // UPDATE TEMPORARY CURVE
                // ==================================

                const pathData =
                    createCurve(
                        startX,
                        startY,
                        mouseX,
                        mouseY
                    );


                temporaryConnection.setAttribute(
                    "d",
                    pathData
                );
            }


            // ==================================
            // NODE DRAGGING
            // ==================================

            if (
                !isDragging
            ) {

                return;
            }


            const canvasRect =
                canvas
                    .getBoundingClientRect();


            // ==================================
            // UPDATE NODE STATE
            // ==================================

            node.position.x =
                event.clientX -
                canvasRect.left -
                offsetX;


            node.position.y =
                event.clientY -
                canvasRect.top -
                offsetY;


            // ==================================
            // UPDATE NODE DOM
            // ==================================

            nodeElement.style.left =
                `${node.position.x}px`;


            nodeElement.style.top =
                `${node.position.y}px`;


            // ==================================
            // UPDATE CONNECTIONS
            // ==================================

            renderConnections();
        }
    );


    // ====================================
    // MOUSE UP
    // ====================================

    document.addEventListener(
        "mouseup",
        event => {


            // ==================================
            // FINISH CONNECTION
            // ==================================

            if (
                isConnecting
            ) {


                // Check whether we released
                // over an input handle.

                const inputHandle =
                    event.target.closest(
                        ".input-handle"
                    );


                // ==================================
                // VALID INPUT
                // ==================================

                if (
                    inputHandle
                ) {


                    const targetNodeElement =
                        inputHandle.closest(
                            ".node"
                        );


                    const targetNodeId =
                        targetNodeElement.dataset.id;


                    // ==================================
                    // PREVENT SELF CONNECTION
                    // ==================================

                    if (
                        targetNodeId !==
                        connectionSource
                    ) {


                        // ==================================
                        // CHECK DUPLICATE
                        // ==================================

                        const alreadyConnected =
                            connections.some(
                                connection =>

                                    connection.source ===
                                    connectionSource &&

                                    connection.sourceHandle ===
                                    connectionSourceHandle &&

                                    connection.target ===
                                    targetNodeId
                            );


                        // ==================================
                        // CREATE CONNECTION
                        // ==================================

                        if (
                            !alreadyConnected
                        ) {

                            const connection = {

                                id:
                                    `connection-${connections.length + 1}`,

                                source:
                                    connectionSource,

                                sourceHandle:
                                    connectionSourceHandle,

                                target:
                                    targetNodeId
                            };


                            connections.push(
                                connection
                            );


                            console.log(
                                "Connection created:",
                                connection
                            );


                            renderConnections();
                        }
                    }
                }


                // ==================================
                // REMOVE TEMPORARY CONNECTION
                // ==================================

                if (
                    temporaryConnection
                ) {

                    temporaryConnection.remove();

                    temporaryConnection =
                        null;
                }


                // ==================================
                // RESET CONNECTION STATE
                // ==================================

                isConnecting =
                    false;


                connectionSource =
                    null;


                connectionSourceHandle =
                    null;
            }


            // ==================================
            // FINISH NODE DRAGGING
            // ==================================

            if (
                !isDragging
            ) {

                return;
            }


            isDragging =
                false;


            nodeElement.style.cursor =
                "grab";
        }
    );
}


// ========================================
// GET OUTPUT HANDLE
// ========================================

function getOutputHandle(
    nodeElement,
    outputType
) {


    // ==================================
    // CONDITIONS → IF
    // ==================================

    if (
        outputType === "if"
    ) {

        return nodeElement.querySelector(
            ".condition-if-handle"
        );
    }


    // ==================================
    // CONDITIONS → ELSE
    // ==================================

    if (
        outputType === "else"
    ) {

        return nodeElement.querySelector(
            ".condition-else-handle"
        );
    }


    // ==================================
    // NORMAL OUTPUT
    // ==================================

    return nodeElement.querySelector(
        ".output-handle"
    );
}


// ========================================
// RENDER CONNECTIONS
// ========================================

function renderConnections() {


    // Clear SVG

    connectionsLayer.innerHTML =
        "";


    // ==================================
    // LOOP CONNECTIONS
    // ==================================

    connections.forEach(
        connection => {


            // ==================================
            // FIND SOURCE NODE
            // ==================================

            const sourceNode =
                document.querySelector(
                    `[data-id="${connection.source}"]`
                );


            // ==================================
            // FIND TARGET NODE
            // ==================================

            const targetNode =
                document.querySelector(
                    `[data-id="${connection.target}"]`
                );


            if (
                !sourceNode ||
                !targetNode
            ) {

                return;
            }


            // ==================================
            // FIND SOURCE HANDLE
            // ==================================

            const outputHandle =
                getOutputHandle(
                    sourceNode,
                    connection.sourceHandle
                );


            // ==================================
            // FIND TARGET HANDLE
            // ==================================

            const inputHandle =
                targetNode.querySelector(
                    ".input-handle"
                );


            if (
                !outputHandle ||
                !inputHandle
            ) {

                return;
            }


            // ==================================
            // GET POSITIONS
            // ==================================

            const outputRect =
                outputHandle
                    .getBoundingClientRect();


            const inputRect =
                inputHandle
                    .getBoundingClientRect();


            const canvasRect =
                canvas
                    .getBoundingClientRect();


            // ==================================
            // START POSITION
            // ==================================

            const startX =
                outputRect.left +
                outputRect.width / 2 -
                canvasRect.left;


            const startY =
                outputRect.top +
                outputRect.height / 2 -
                canvasRect.top;


            // ==================================
            // END POSITION
            // ==================================

            const endX =
                inputRect.left +
                inputRect.width / 2 -
                canvasRect.left;


            const endY =
                inputRect.top +
                inputRect.height / 2 -
                canvasRect.top;


            // ==================================
            // CREATE PATH
            // ==================================

            const path =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );


            const pathData =
                createCurve(
                    startX,
                    startY,
                    endX,
                    endY
                );


            path.setAttribute(
                "d",
                pathData
            );


            // ==================================
            // PATH STYLE
            // ==================================

            path.setAttribute(
                "fill",
                "none"
            );


            path.setAttribute(
                "stroke",
                "#999"
            );


            path.setAttribute(
                "stroke-width",
                "2"
            );


            path.setAttribute(
                "stroke-linecap",
                "round"
            );


            // ==================================
            // ADD PATH
            // ==================================

            connectionsLayer.appendChild(
                path
            );
        }
    );
}


// ========================================
// SIDEBAR CLICK
// ========================================

libraryItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {


                const type =
                    item.dataset.type;


                const newNode =
                    createNode(type);


                nodes.push(
                    newNode
                );


                renderNode(
                    newNode
                );
            }
        );
    }
);


// ========================================
// SIDEBAR DRAG
// ========================================

libraryItems.forEach(
    item => {


        // Make library item draggable

        item.draggable =
            true;


        // ==================================
        // DRAG START
        // ==================================

        item.addEventListener(
            "dragstart",
            event => {


                const type =
                    item.dataset.type;


                // Store node type
                // inside drag data.

                event.dataTransfer.setData(
                    "nodeType",
                    type
                );
            }
        );
    }
);


// ========================================
// ALLOW DROP
// ========================================

canvas.addEventListener(
    "dragover",
    event => {

        event.preventDefault();
    }
);


// ========================================
// DROP NODE
// ========================================

canvas.addEventListener(
    "drop",
    event => {

        event.preventDefault();


        // ==================================
        // GET NODE TYPE
        // ==================================

        const type =
            event.dataTransfer.getData(
                "nodeType"
            );


        if (
            !type
        ) {

            return;
        }


        // ==================================
        // GET CANVAS POSITION
        // ==================================

        const canvasRect =
            canvas.getBoundingClientRect();


        // ==================================
        // CREATE NODE
        // ==================================

        const newNode =
            createNode(type);


        // ==================================
        // POSITION NODE
        // ==================================

        newNode.position.x =
            event.clientX -
            canvasRect.left -
            40;


        newNode.position.y =
            event.clientY -
            canvasRect.top -
            40;


        // ==================================
        // STORE NODE
        // ==================================

        nodes.push(
            newNode
        );


        // ==================================
        // RENDER NODE
        // ==================================

        renderNode(
            newNode
        );


        console.log(
            "Node created:",
            newNode
        );
    }
);