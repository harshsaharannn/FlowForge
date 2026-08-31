//Phase 1 & 2
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

const outputNode = {
    id: "node-3",
    type: "output",
    position: {
        x: 700,
        y: 200
    },
    configuration: {}
};

const connection1 = {
    source: "node-1",
    target: "node-2"
};
const connection2 = {
    source: "node-2",
    target: "node-3"
};
const nodes = [];
let connections = [];

//addded all the workflow 
nodes.push(triggerNode , apiNode , outputNode);
connections.push(connection1 , connection2);

//updating nodes
const updatedNode = nodes.find(node=>node.id === triggerNode.id);
updatedNode.position.x = 100;
updatedNode.position.y = 400;

//delete nodes
const deleteIndexNode = nodes.findIndex(node=>node.id === outputNode.id)
nodes.splice(deleteIndexNode , 1);

// connections get effected too 
connections = connections.filter(connection=>{
     return connection.source !== outputNode.id && connection.target !== outputNode.id
});

//Create workflow
const workflow = {nodes , connections};

//validate
const isValid = connections.every(connection =>{
    const sourceNode = nodes.find(node=>{
       return node.id === connection.source
    });
    const targetNode = nodes.find(node =>{
        return node.id === connection.target
    });
    return sourceNode && targetNode;
})


console.log(workflow);
console.log(isValid);

// Phase 3 ---------------------------------------
const nodeElement = document.querySelectorAll(".node");
const canvas = document.querySelector(".canvas");
let offsetX = 0;
let offsetY = 0;
let selectedNode = null;

nodeElement.forEach(node =>{
  node.addEventListener("mousedown" , event =>{
    selectedNode = node;
    const rect = node.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
   
    document.addEventListener("mousemove", moveNode);
  });
  document.addEventListener("mouseup" , ()=>{
    selectedNode = null;
    document.removeEventListener("mousemove" , moveNode);
  });
});

function moveNode(event){
    if(!selectedNode)return;
    const canvasRect = canvas.getBoundingClientRect()
    selectedNode.style.left = event.clientX - canvasRect.left - offsetX + "px";
    selectedNode.style.top = event.clientY - canvasRect.top - offsetY + "px";
}; 
