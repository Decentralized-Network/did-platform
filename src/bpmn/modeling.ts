const Convert = require('xml-js');

export function extract_process_from_xml(xml: string): Array<any> {
  const options = {
    compact: true,
    alwaysArray: true,
    ignoreDeclaration: true,
  };

  const js = Convert.xml2js(xml, options);

  return js['bpmn2:definitions'][0]['bpmn2:process'];
}

const attr = '_attributes';
const attrid = 'id';
const attrname = 'name';

// id 로 요소 찾기
export function find_element_by_id(js: any, id: string): any {
  for (let [key, value] of Object.entries<Array<any>>(js)) {
    for (let v of value) {
      let cur_id = v['_attributes']['id'];
      if (cur_id == id) {
        return value;
      }
    }
  }
  return null;
}

export function find_element_by_name(js: any, name: string): any {
  for (let [key, value] of Object.entries<Array<any>>(js)) {
    if (key == name) {
      return value;
    }
  }
  return null;
}

class Node {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class Edge {
  id: string;
  source: string;
  target: string;

  constructor(id: string, source: string, target: string) {
    this.id = id;
    this.source = source;
    this.target = target;
  }
}

class CompactNode {
  nodeId: string;
  edgeId: string;

  constructor(nodeId: string, edgeId: string) {
    this.nodeId = nodeId;
    this.edgeId = edgeId;
  }
}

const attr_flow = 'bpmn2:sequenceFlow';
const attr_source = 'sourceRef';
const attr_target = 'targetRef';

type EdgeCache = {
  [id: string]: Edge;
};

type NodeCache = {
  [id: string]: Node;
};

type Graph = {
  [id: string]: Array<CompactNode>;
};

type Processes = {
  [id: string]: Graph;
};

function extract_process_graph_from_xml(
  xml: string
): [NodeCache, EdgeCache, Processes] {
  let node_cache: NodeCache = {};
  let edge_cache: EdgeCache = {};

  function getNode(process: any, node_id: string): Node {
    if (node_id in node_cache) return node_cache[node_id];

    let element = find_element_by_id(process, node_id);

    if (element == null) {
      throw 'Id undefined' + node_id;
    }
    element = element[0];
    let eid = element[attr][attrid];
    let name = element[attr][attrname];
    let node = new Node(eid, name);
    node_cache[node.id] = node;
    return node;
  }

  let processes: Processes = {};
  let js = extract_process_from_xml(xml);
  for (let process of js) {
    let pid = process[attr][attrid];
    let name = process[attr][attrname];
    let pnode = new Node(pid, name);
    node_cache[pnode.id] = pnode;

    let relations: Graph = {};

    // 노드간 모든 관계가 포함되어 있다.
    let flows = find_element_by_name(process, attr_flow) as Array<any>;
    for (let flow of flows) {
      console.log(flow);
      let flow_id = flow[attr][attrid];
      let source_id = flow[attr][attr_source];
      let target_id = flow[attr][attr_target];
      edge_cache[flow_id] = new Edge(flow_id, source_id, target_id);

      let source = getNode(process, source_id);
      let target = getNode(process, target_id);

      if (!(source.id in relations)) {
        relations[source.id] = [];
      }

      relations[source.id].push(new CompactNode(target.id, flow_id));
    }

    processes[pnode.id] = relations;
  }
  return [node_cache, edge_cache, processes];
}
