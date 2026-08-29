const apiRequestNode = {
    id: "node-1",
    type: "apirequest",
    position: {
        x: 200,
        y: 400
    },
    configuration: {
        method: "GET",
        url: "https://example.com"
    }

};
const triggerNode = {
    id: "node-2",
    type: "trigger",
    position: {
        x: 100,
        y: 300
    }
}
const conditionNode = {
    id: "node-3",
    type: "condition",
    position: {
        x: 300,
        y: 300
    },
    configuration: {
        field: "followers",
        operator: ">",
        value: 100
    }

}
const connection1 = {
    source : triggerNode.id , 
    target : apiRequestNode.id 

}
const connection2 = {
    source : apiRequestNode.id , 
    target : conditionNode.id
}
const nodes = [];
const connections = [];
nodes.push(apiRequestNode , triggerNode , conditionNode);
connections.push(connection1 , connection2);


const workflow = {nodes , connections};
