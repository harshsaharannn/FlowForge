const nodes = [];
const connections =[];
const canvas = document.querySelector(".canvas");

const libraryItems = document.querySelectorAll(".library-item");


function createNode(type){
    const node = {
        id: `node-${nodes.length+1}`,
        type : type,
        position: {
            x:100 + (nodes.length * 180) ,
            y:200
        },
        configuration:{}
    }
    return node;
};

function renderNode(node){ 
    const nodeElement = document.createElement("div");
    nodeElement.classList.add("node");
    nodeElement.dataset.id = node.id;
    nodeElement.style.left = `${node.position.x}px`;
    nodeElement.style.top = `${node.position.y}px`;

   //node card
   const card = document.createElement("div");
   card.classList.add("node-card");

   const icon = document.createElement("img");
   icon.src = `assets/${node.type === "condition" ? "Conditions" : node.type.charAt(0).toUpperCase() + node.type.slice(1)}.svg`;
    icon.classList.add("node-icon");

   const label = document.createElement("span");
   label.textContent = node.type.charAt(0).toUpperCase()+node.type.slice(1);
   label.classList.add("node-label");

   let inputHandle = null;
   let outputHandle = null;

    if (node.type !== "trigger") {
    inputHandle = document.createElement("div");
    inputHandle.classList.add("handle", "input-handle");
    card.appendChild(inputHandle);
}

    if (node.type !== "output") {
    outputHandle = document.createElement("div");
    outputHandle.classList.add("handle", "output-handle");
    card.appendChild(outputHandle);
}
     
card.appendChild(inputHandle);
card.appendChild(icon);
card.appendChild(outputHandle);

nodeElement.appendChild(card);
nodeElement.appendChild(label);

canvas.appendChild(nodeElement);
makeNodeDraggable(nodeElement, node);

};

function makeNodeDraggable(nodeElement , node){
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    nodeElement.addEventListener("mousedown", event =>{
        isDragging = true;
        const nodeRect = nodeElement.getBoundingClientRect();
        offsetX = event.clientX - nodeRect.left;
        offsetY = event.clientY - nodeRect.top;
    });
    document.addEventListener("mousemove" , event=>{
      if(!isDragging)return;

      const canvasRect = canvas.getBoundingClientRect();
      node.position.x = event.clientX - canvasRect.left - offsetX;
      node.position.y = event.clientY - canvasRect.top - offsetY;

      nodeElement.style.left = `${node.position.x}px`;

        nodeElement.style.top = `${node.position.y}px`;

 
    });
    document.addEventListener("mouseup" , ()=>{
        isDragging = false;

    });
};

libraryItems.forEach(item =>{
    item.addEventListener("click" , ()=>{
    const type = item.dataset.type;
    const newNode =  createNode(type);
    console.log("Clicked item:", item);
    console.log("Node type:", type);

    nodes.push(newNode);
    renderNode(newNode);

   
    });
    
});

libraryItems.forEach(item =>{
    item.setAttribute("draggable" , "true");
    item.addEventListener("dragstart" , event=>{
         const type = item.dataset.type;
        event.dataTransfer.setData("nodeType" , type);

    });
});

canvas.addEventListener("dragover" , event=>{
        event.preventDefault();
});

canvas.addEventListener("drop" , event=>{
     event.preventDefault();
 const type = event.dataTransfer.getData("nodeType");
 const canvasRect = canvas.getBoundingClientRect();
 const newNode = createNode(type);
 newNode.position.x = event.clientX - canvasRect.left;
 newNode.position.y = event.clientY - canvasRect.top;

  nodes.push(newNode);
  renderNode(newNode);

});


