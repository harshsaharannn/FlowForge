// state

const nodes = [];
const connections = [];

let isConnecting = false;
let connectionSource = null;
let  connectionSourceHandle = null;
let temporaryConnection = null;
let selectedConnectionId = null;
let selectedConnectionsElement = null;
let selectedNodeId = null;
let selectedNodesElement = null;

//DOM elements 

const canvas = document.querySelector(".canvas");
const connectionsLayer = document.querySelector(".connections");
const libraryItems = document.querySelectorAll(".library-item");
const deleteBtn = document.getElementById("deleteConnectionBtn");

// Click handler for delete button
deleteBtn.addEventListener("click", () => {
    if(!selectedConnectionId) return;

    const connectionIndex = connections.findIndex(conn => conn.id === selectedConnectionId);
    if(connectionIndex !== -1){
        connections.splice(connectionIndex, 1);
    }

    deleteBtn.style.display = "none";
    selectedConnectionId = null;
    if(selectedConnectionsElement){
        selectedConnectionsElement.classList.remove("selected");
        selectedConnectionsElement = null;
    }

    renderConnections();
});

// Keep delete button visible when hovering over it
deleteBtn.addEventListener("mouseenter", () => {
    deleteBtn.style.display = "flex";
});

deleteBtn.addEventListener("mouseleave", () => {
    deleteBtn.style.display = "none";
    selectedConnectionId = null;
    if(selectedConnectionsElement){
        selectedConnectionsElement.classList.remove("selected");
        selectedConnectionsElement = null;
    }
});

const deleteNodeIcon = document.getElementById("deleteNodeIcon");

// Click handler for node delete icon
deleteNodeIcon.addEventListener("click", () => {
    if(!selectedNodeId) return;

    const nodeIndex = nodes.findIndex(n => n.id === selectedNodeId);
    if(nodeIndex !== -1){
        nodes.splice(nodeIndex, 1);
    }

    deleteNodeIcon.style.display = "none";
    selectedNodeId = null;
    if(selectedNodesElement){
        selectedNodesElement.remove();
        selectedNodesElement = null;
    }
});

// Keep node delete icon visible when hovering over it
deleteNodeIcon.addEventListener("mouseenter", () => {
    deleteNodeIcon.style.display = "flex";
});

deleteNodeIcon.addEventListener("mouseleave", () => {
    deleteNodeIcon.style.display = "none";
    selectedNodeId = null;
    if(selectedNodesElement){
        selectedNodesElement.classList.remove("node-selected");
        selectedNodesElement = null;
    }
});



//create node 

function createNode(type){
    const node = {
     id: `node-${nodes.length+1}`,
     type: type,
     position:{
        x: 100 +(nodes.length*180),
        y:100
     },
     configuration:{}
    };
    return node;
};

//create curved path 

function createCurve(startX , startY , endX , endY){
   const distance = Math.abs(endX-startX);
   const curve = Math.max(60 , distance*0.5);
   const controlPoint1X = startX + curve;
   const controlPoint1Y = startY;
   const controlPoint2X = endX - curve;
   const controlPoint2Y = endY;

   return `M ${startX}  ${startY}
   C ${controlPoint1X} ${controlPoint1Y},
   ${controlPoint2X} ${controlPoint2Y} , 
   ${endX} ${endY}`
};

//render node

function renderNode(node){
   const nodeElement = document.createElement("div");
   nodeElement.classList.add("node");
   nodeElement.dataset.id = node.id;
   nodeElement.style.left =`${node.position.x}px`;
   nodeElement.style.top = `${node.position.y}px`;
   nodeElement.draggable = false;

   nodeElement.addEventListener("mouseenter", (event)=>{
    event.stopPropagation();
    if(selectedNodesElement){
        selectedNodesElement.classList.remove("node-selected");
    }
    selectedNodeId = node.id;
    selectedNodesElement = nodeElement;
    nodeElement.classList.add("node-selected");
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const iconX = nodeRect.left - canvasRect.left + 40;
    const iconY = nodeRect.top - canvasRect.top -12;

    deleteNodeIcon.style.display = "flex";
    deleteNodeIcon.style.left = `${iconX - 12}px`;
    deleteNodeIcon.style.top = `${iconY}px`;
   });

   nodeElement.addEventListener("mouseleave",(event)=>{
    // Don't clear or hide - let the icon's mouseleave handle it
    // This keeps selectedNodeId intact when moving to the icon
   });
   


   //node card
   const card = document.createElement("div");
   card.classList.add( "node-card");
   card.draggable = false;

   //icon
   const icon = document.createElement("img");
   icon.draggable = false;
   const iconNames = {
    trigger: "Trigger.svg",
    api: "API.svg",
    condition: "Conditions.svg",
    transform:"Transform.svg",
    output: "Output.svg"
   };
  icon.src = `assets/${iconNames[node.type]}`;
  icon.classList.add("node-icon");

  //input handles
  if(node.type !== "trigger"){
    const inputHandle = document.createElement("div");
    inputHandle.classList.add("handle", "input-handle");
    inputHandle.draggable = false;
    card.appendChild(inputHandle);
  }
 //icon
 card.appendChild(icon)

 //output handles
 if(node.type === "condition"){
    const ifHandle = document.createElement("div");
    
    //if Output
    ifHandle.classList.add("handle", "output-handle", "condition-if-handle");
    ifHandle.dataset.output = "if";
    ifHandle.draggable = false;
    setupOutputHandle(ifHandle , node , "if");
    card.appendChild(ifHandle);

    //else Output
    const elseHandle = document.createElement("div");
    elseHandle.classList.add("handle","output-handle", "condition-else-handle");
    elseHandle.dataset.output = "else";
    elseHandle.draggable = false;
    setupOutputHandle(elseHandle , node , "else");
    card.appendChild(elseHandle);
 }
 else if(node.type !== "output"){
    const outputHandle = document.createElement("div");
    outputHandle.classList.add("handle", "output-handle");
    outputHandle.dataset.output ="output";
    outputHandle.draggable =false;
    setupOutputHandle(outputHandle,node,"output");
    card.appendChild(outputHandle); 

    //label

 }
  const label = document.createElement("span");
    label.textContent =node.type.charAt(0).toUpperCase() + node.type.slice(1);
    label.classList.add("node-label");
    label.draggable =false;

    //add card + label
    nodeElement.appendChild(card);
    nodeElement.appendChild(label);

    //add node to canvas
    canvas.appendChild(nodeElement);

    //make the node draggable
    makeNodeDraggable(nodeElement , node);
};
//setup ouput handle
function setupOutputHandle(outputHandle , node , outputType){
    outputHandle.addEventListener("mousedown" , event =>{
    
    //start connection
    event.preventDefault();
    event.stopPropagation();
    
  isConnecting = true;
  connectionSource = node.id;
  connectionSourceHandle = outputType;

  //get handle position
  const handleRect = outputHandle.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  const startX = handleRect.left + handleRect.width/2 - canvasRect.left;
  const startY = handleRect.top + handleRect.height/2 - canvasRect.top;

  //create temporary curve
  temporaryConnection = document.createElementNS("http://www.w3.org/2000/svg","path");

  const pathData = createCurve(startX , startY , startX , startY);

  temporaryConnection.setAttribute("d" , pathData);
  temporaryConnection.setAttribute("fill" , "none");
  temporaryConnection.setAttribute("stroke" , "#999");
  temporaryConnection.setAttribute("stroke-width" , "2");
  temporaryConnection.setAttribute("stroke-linecap" , "round");
  connectionsLayer.appendChild(temporaryConnection);
})};
//node dragging
function makeNodeDraggable(nodeElement , node){
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

nodeElement.addEventListener("mousedown" , event =>{
if(event.target.classList.contains("handle")){
    return;
};
event.preventDefault();

//start dragging
isDragging = true;
const nodeRect = nodeElement.getBoundingClientRect();
offsetX = event.clientX - nodeRect.left;
offsetY = event.clientY - nodeRect.top;

nodeElement.style.cursor = "grabbing";
});
//mousemove
document.addEventListener("mousemove" , event =>{

if(isConnecting){
    const canvasRect = canvas.getBoundingClientRect();
    //get mouse position with respect to canvas
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    //find the source node
    const sourceNodeElement = document.querySelector(`[data-id ="${connectionSource}"]`);
    if(!sourceNodeElement){
        return;
    }
    //find correct output handle
    const sourceOutputHandle = getOutputHandle(sourceNodeElement, connectionSourceHandle);

    if(!sourceOutputHandle){
        return;
    }

    const outputRect = sourceOutputHandle.getBoundingClientRect();

    const startX = outputRect.left + outputRect.width/2 - canvasRect.left;
    const startY = outputRect.top + outputRect.height/2 - canvasRect.top;

    //update temporary curve
    const pathData = createCurve(startX , startY , mouseX , mouseY);
    temporaryConnection.setAttribute("d" , pathData);

}
    if(!isDragging){
        return ; }
    const canvasRect = canvas.getBoundingClientRect();

    node.position.x = event.clientX - canvasRect.left - offsetX;
    node.position.y = event.clientY - canvasRect.top - offsetY;

    nodeElement.style.left = `${node.position.x}px`;
    nodeElement.style.top = `${node.position.y}px`;

    renderConnections();

    if(selectedConnectionId){
     const newSelectedPath = connectionsLayer.querySelector(`[data-id="${selectedConnectionId}"]`);

     if(newSelectedPath){
        selectedConnectionsElement = newSelectedPath;
        newSelectedPath.classList.add("selected");

        const pathBBox = newSelectedPath.getBBox();
        const pathCenterX = pathBBox.x + pathBBox.width/2;
        const pathCenterY = pathBBox.y + pathBBox.height/2;

        deleteBtn.style.left = `${pathCenterX - 16}px`;
        deleteBtn.style.top = `${pathCenterY - 16}px`;
     }
    };

    if(selectedNodeId && selectedNodesElement){
        const nodeRect = selectedNodesElement.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const iconX = nodeRect.left - canvasRect.left + 40;
        const iconY = nodeRect.top - canvasRect.top - 12;

        deleteNodeIcon.style.left = `${iconX - 12}px`;
        deleteNodeIcon.style.top = `${iconY}px`;
    }



});
    document.addEventListener("mouseup" , event =>{
    if(isConnecting){
        const inputHandle = event.target.closest(".input-handle");
        if(inputHandle){
            const targetNodeElement = inputHandle.closest(".node");
            const targetNodeId = targetNodeElement.dataset.id

        if(targetNodeId !== connectionSource){
         const alreadyConnected = connections.some(connection =>{
          return connection.source === connectionSource && connection.sourceHandle === connectionSourceHandle
         && connection.target === targetNodeId }
        );

        if(!alreadyConnected){
            const connection = {
                id: `connection-${connections.length + 1}`,
                source: connectionSource,
                sourceHandle: connectionSourceHandle,
                target: targetNodeId
            };
        connections.push(connection);
        console.log("Connection created:" , connection);

        renderConnections();
        }
    }
}
       if(temporaryConnection){
        temporaryConnection.remove();
        temporaryConnection = null;
       }

       isConnecting = false;
       connectionSource = null;
       connectionSourceHandle = null;

    }
    if(!isDragging){
        return;
    }
    isDragging = false;

    nodeElement.style.cursor = "grab";

    });
};

function getOutputHandle(nodeElement , outputType){
    if(outputType === "if"){
        return nodeElement.querySelector(".condition-if-handle");
    }
    if(outputType === "else"){
        return nodeElement.querySelector(".condition-else-handle");
    }
    return nodeElement.querySelector(".output-handle");
}

function renderConnections(){
    connectionsLayer.innerHTML = "";
    connections.forEach(connection =>{
    const sourceNode =   document.querySelector(`[data-id="${connection.source}"]`);
    const targetNode = document.querySelector(`[data-id="${connection.target}"]`);
    
    if(!sourceNode || !targetNode){
        return;
    }
    const outputHandle = getOutputHandle(sourceNode , connection.sourceHandle);
    const inputHandle = targetNode.querySelector(".input-handle");
    if(!outputHandle || !inputHandle){
        return;
    }

    const outputRect = outputHandle.getBoundingClientRect();
    const inputRect = inputHandle.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const startX = outputRect.left + outputRect.width/2 - canvasRect.left;
    const startY = outputRect.top + outputRect.height/2 - canvasRect.top;

    const endX = inputRect.left + inputRect.width/2 - canvasRect.left;
    const endY = inputRect.top + inputRect.height/2 - canvasRect.top;

    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    const pathData = createCurve(startX , startY , endX , endY);

    path.setAttribute("d", pathData);
    path.setAttribute("fill" , "none");
    path.setAttribute("stroke", "#999");
    path.setAttribute("stroke-width" , "2");
    path.setAttribute("stroke-linecap" , "round");

    path.dataset.id = connection.id
    path.addEventListener("mouseenter" , (event) =>{
        event.stopPropagation();
        if(selectedConnectionsElement){
          selectedConnectionsElement.classList.remove("selected");
        }
    selectedConnectionId = path.dataset.id;
    selectedConnectionsElement = path;
    path.classList.add("selected");

    const pathBBox = path.getBBox();
    const pathCenterX = pathBBox.x + pathBBox.width/2;
    const pathCenterY = pathBBox.y + pathBBox.height/2;

    deleteBtn.style.display = "flex";
    deleteBtn.style.left = `${pathCenterX - 16}px`;
    deleteBtn.style.top = `${pathCenterY - 16}px`;

    canvas.addEventListener("click" , (event)=>{
    if(event.target === canvas){
        if(selectedConnectionsElement){
            selectedConnectionsElement.classList.remove("selected");
        }
        deleteBtn.style.display = "none";
        selectedConnectionId = null;
        selectedConnectionsElement = null;
    }
    });
        
     
    });
    path.addEventListener("mouseleave" , (event)=>{
        // Don't clear or hide - let the button's mouseleave handle it
        // This keeps selectedConnectionId intact when moving to the button
    });
    
    connectionsLayer.appendChild(path);
    });
};

libraryItems.forEach(item =>{
    item.addEventListener("click" , () =>{
        const type = item.dataset.type;
        const newNode = createNode(type);
        nodes.push(newNode);
        renderNode(newNode);
    });
libraryItems.forEach(item =>{
    item.draggable = true;
    item.addEventListener("dragstart" , event =>{
        const type = item.dataset.type;
        event.dataTransfer.setData("nodeType", type);

    });
});
});
canvas.addEventListener("dragover" , event =>{
event.preventDefault();
});

canvas.addEventListener("drop" , event =>{
    event.preventDefault();
    const type = event.dataTransfer.getData("nodeType");
    if(!type){
        return;
    }
    const canvasRect = canvas.getBoundingClientRect();

    const newNode = createNode(type);

    newNode.position.x = event.clientX - canvasRect.left - 40;
    newNode.position.y = event.clientY - canvasRect.top - 40;
    nodes.push(newNode);
    renderNode(newNode);

    console.log("node created:" , newNode);
    
});




