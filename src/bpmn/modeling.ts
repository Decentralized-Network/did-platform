const Convert = require('xml-js');

const attr = '_attributes';
const attrid = 'id';
const attrname = 'name';
const attr_flow = 'bpmn2:sequenceFlow';
const attr_source = 'sourceRef';
const attr_target = 'targetRef';

function extract_process_from_xml(xml: string): Array<any> {
  const options = {
    compact: true,
    alwaysArray: true,
    ignoreDeclaration: true,
  };

  const js = Convert.xml2js(xml, options);

  return js['bpmn2:definitions'][0]['bpmn2:process'];
}

// id 로 요소 찾기
function find_element_by_id(js: any, id: string): any {
  for (let [key, value] of Object.entries<Array<any>>(js)) {
    for (let v of value) {
      let cur_id = v['_attributes']['id'];
      if (cur_id == id) {
        return [key, value];
      }
    }
  }
  return null;
}

function find_element_by_name(js: any, name: string): any {
  for (let [key, value] of Object.entries<Array<any>>(js)) {
    if (key == name) {
      return value;
    }
  }
  return null;
}

class Node {
  key: string;
  id: string;
  name: string;
  js: any;

  constructor(key: string, id: string, name: string, js: any) {
    this.key = key;
    this.id = id;
    this.name = name;
    this.js = js;
  }

  public toString = (): string => {
    return `key: ${this.key}, id: ${this.id}, name: ${this.name}`;
  };
}

class Edge {
  id: string;
  source: string;
  target: string;
  conditionExpression: string;
  js: any;

  constructor(
    id: string,
    source: string,
    target: string,
    conditionExpression: string,
    js: any
  ) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.conditionExpression = conditionExpression;
    this.js = js;
  }

  public toString = (): string => {
    return `id: ${this.id}, source: ${this.source}, target: ${this.target}, express: ${this.conditionExpression}`;
  };
}

class CompactNode {
  nodeId: string;
  edgeId: string;

  constructor(nodeId: string, edgeId: string) {
    this.nodeId = nodeId;
    this.edgeId = edgeId;
  }

  public toString = (): string => {
    return `nodeId: ${this.nodeId}, edgeId: ${this.edgeId}`;
  };
}

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

export function extract_process_graph_from_xml(
  xml: string
): [NodeCache, EdgeCache, Processes] {
  let node_cache: NodeCache = {};
  let edge_cache: EdgeCache = {};

  function getNode(process: any, node_id: string): Node {
    if (node_id in node_cache) return node_cache[node_id];

    let [key, element] = find_element_by_id(process, node_id);

    if (element == null) {
      throw 'Id undefined' + node_id;
    }
    element = element[0];
    let eid = element[attr][attrid];
    let name = element[attr][attrname];
    let node = new Node(key, eid, name, element);
    node_cache[node.id] = node;
    return node;
  }

  let processes: Processes = {};
  let js = extract_process_from_xml(xml);
  for (let process of js) {
    let pid = process[attr][attrid];
    let name = process[attr][attrname];
    let pnode = new Node('process', pid, name, process);
    node_cache[pnode.id] = pnode;

    let relations: Graph = {};

    // 노드간 모든 관계가 포함되어 있다.
    let flows = find_element_by_name(process, attr_flow) as Array<any>;
    for (let flow of flows) {
      let flow_id = flow[attr][attrid];
      let source_id = flow[attr][attr_source];
      let target_id = flow[attr][attr_target];
      let conditionExpression = '';
      if ('bpmn2:conditionExpression' in flow) {
        conditionExpression = flow['bpmn2:conditionExpression'][0]['_text'][0];
      }
      edge_cache[flow_id] = new Edge(
        flow_id,
        source_id,
        target_id,
        conditionExpression,
        flow
      );

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
