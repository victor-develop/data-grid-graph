import React, { useEffect, useState } from 'react';
import G6, { Graph, GraphData } from '@antv/g6';
import ReactDOM from 'react-dom';
import EditModal, { EditData } from './EditModal/EditModal';
import styles from './GraphContainer.module.scss';

const data: GraphData = {
  nodes: [
    {
      id: 'return',
      label: 'return',
      data: {
        model: {
          fields: {},
          rows: [],
        },
      },
    },
    {
      id: 'order',
      label: 'order',
      data: {
        model: {
          fields: {
            'Field Key': 'string',
            'PII(Personal Identifiable Information)': 'boolean',
            Type: 'string',
            Nullable: 'boolean',
          },
          rows: [
            {
              'Field Key': 'order_id',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'fulfillment_id',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'fulfillment_at',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'timestamp',
              Nullable: 'false',
            },
          ],
        },
      },
    },
    {
      id: 'fulfillment',
      label: 'fulfillment',
      data: {
        model: {
          fields: {
            'Field Key': 'string',
            'PII(Personal Identifiable Information)': 'boolean',
            Type: 'string',
            Nullable: 'boolean',
          },
          rows: [
            {
              'Field Key': 'order_id',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'fulfillment_id',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'fulfillment_at',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'timestamp',
              Nullable: 'false',
            },
          ],
        },
      },
    },
    {
      id: 'tracking',
      label: 'tracking',
      data: {
        model: {
          fields: {
            'Field Key': 'string',
            'PII(Personal Identifiable Information)': 'boolean',
            Type: 'string',
            Nullable: 'boolean',
          },
          rows: [
            {
              'Field Key': 'order_id',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'fulfillment_id',
              'PII(Personal Identifiable Information)': 'true',
              Type: 'string',
              Nullable: 'false',
            },
            {
              'Field Key': 'tracking_number',
              'PII(Personal Identifiable Information)': 'false',
              Type: 'timestamp',
              Nullable: 'false',
            },
          ],
        },
      },
    },
  ],
  edges: [
    {
      source: 'order',
      target: 'fulfillment',
      label: 'order_id',
      data: ['order_id(Field Key, PII, Type, Nullable)'],
    },
    {
      source: 'fulfillment',
      target: 'tracking',
      label: 'order_id, fulfillment_id',
      data: [
        'order_id(Field Key, PII, Type)',
        'fulfillment_id(Field Key, PII, Type)',
      ],
    },
    {
      source: 'order',
      target: 'return',
      label: 'order_id',
      data: ['order_id(Field Key, PII, Type, Nullable)'],
    },
  ],
};

const tooltip = new G6.Tooltip({
  offsetX: 10,
  offsetY: 20,
  getContent(e) {
    const data = e?.item?.getModel()?.data as string[] | undefined;
    if (!data) return '';
    const res = `<ul>
    ${data.map((it) => `<li>${it}</li>`).join('')}
    </ul>`;
    return res;
  },
  itemTypes: ['edge'],
});

const calcSep = (graph: Graph, id: string): number => {
  const node = graph.findById(id);
  const neighbors = (node as any).getNeighbors('source');
  return neighbors.length * 10;
};

const GraphContainer = () => {
  const ref = React.useRef(null);
  let graph: Graph;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditData | null>(null);
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };
  useEffect(() => {
    if (!graph) {
      graph = new G6.Graph({
        container: ReactDOM.findDOMNode(ref.current) as HTMLElement,
        fitView: true,
        modes: {
          default: ['drag-canvas', 'scroll-canvas', 'zoom-canvas', 'drag-node'],
        },
        layout: {
          type: 'dagre',
          rankdir: 'TB',
          align: 'UL',
          nodesepFunc: ({ id }: { id: string }) => calcSep(graph, id),
          ranksepFunc: ({ id }: { id: string }) => calcSep(graph, id),
        },
        defaultNode: {
          type: 'modelRect',
          size: [120, 50],
          logoIcon: {
            show: false,
          },
          stateIcon: {
            show: false,
          },
        },
        defaultEdge: {
          type: 'polyline',
          style: {
            endArrow: {
              path: 'M 0,0 L 8,4 L 8,-4 Z',
              fill: '#e2e2e2',
            },
          },
          labelCfg: {
            style: {
              fontSize: 10,
            },
          },
        },
        plugins: [tooltip],
      });
    }
    graph.data(data);
    graph.on('node:click', ({ item }) => {
      const data = item?.getModel() as any;
      if (!data) return;
      setEditData({ id: data.id, model: data.data.model });
      setShowEditModal(true);
    });
    graph.render();
  }, []);

  return (
    <>
      <div
        className={`${styles['graph-container']} ${
          showEditModal ? styles.edit : ''
        }`}
        ref={ref}
      ></div>
      {showEditModal && editData && (
        <EditModal {...editData} closeEditModal={closeEditModal} />
      )}
    </>
  );
};

export default GraphContainer;
