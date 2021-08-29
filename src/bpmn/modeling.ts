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

// const result = extract_process_from_xml(test_xml);
// console.log(result);
// console.log(result['bpmn2:sequenceFlow'][0]['_attributes']['id']);
// console.log(result['bpmn2:exclusiveGateway'][0]['bpmn2:incoming'][0]);
// console.log(find_element_by_id(result[0], 'Flow_0qdz5ko'));
// console.log(find_element_by_name(result[0], 'bpmn2:startEvent'));
// console.log(find_element_by_name(result[0], 'bpmn2:sequenceFlow'));

class Node {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

const attr_flow = 'bpmn2:sequenceFlow';
const attr_source = 'sourceRef';
const attr_target = 'targetRef';

let node_cache: { [id: string]: Node } = {};

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

function extract_process_graph_from_xml(xml: string): {
  [id: string]: { [id: string]: Array<Node> };
} {
  // Process 별로, 가지고 있음.
  let ret: { [id: string]: { [id: string]: Array<Node> } } = {};
  let js = extract_process_from_xml(xml);
  for (let process of js) {
    let pid = process[attr][attrid];
    let name = process[attr][attrname];
    let pnode = new Node(pid, name);
    node_cache[pnode.id] = pnode;

    let relations: { [id: string]: Array<Node> } = {};

    // 노드간 모든 관계가 포함되어 있다.
    let flows = find_element_by_name(process, attr_flow) as Array<any>;
    for (let flow of flows) {
      console.log(flow);
      let source_id = flow[attr][attr_source];
      let target_id = flow[attr][attr_target];

      let source = getNode(process, source_id);
      let target = getNode(process, target_id);

      if (!(source.id in relations)) {
        relations[source.id] = [];
      }
      relations[source.id].push(target);
    }

    ret[pnode.id] = relations;
  }
  return ret;
}

let result = extract_process_graph_from_xml(test_xml);

console.log(result);
