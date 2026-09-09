// state

const nodes = [];
const connections = [];

let isConnecting = false;
let connectionSource = null;
let  connectionSourceHandle = null;
let temporaryConnection = null;

//DOM elements 

const canvas = document.querySelector(".canvas");
const connectionsLayer = document.querySelector(".connections");
const libraryItems = document.querySelectorAll(".library-item");

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
    const sourceNodeElement = document.querySelector(`data-id = "${connectionSource}"`);
    if(!sourceNodeElement){
        return;
    }
    //find correct output handle
    const sourceOutputHandle = getOutputHandle(sourceNodeElement, connectionSourceHandle);

    if(!setupOutputHandle){
        return;
    }

    const outputRect = sourceOutputHandle.getBoundingClientRect();

    const startX = outputRect.left + outputRect.width/2 - canvasRect.left;
    const startY = outputRect.top + outputRect.height/2 - canvasRect.top;

    //update temporary curve
    const pathData = createCurve(startX , startY , mouseX , mouseY);
    temporaryConnection.setAttribute("d" , pathData);

}});
}



