import React, { useEffect, useRef, useState } from 'react';
import G6, { Graph, GraphData } from '@antv/g6';
import ReactDOM from 'react-dom';
import EditModal, { EditData } from './EditModal/EditModal';
import styles from './GraphContainer.module.scss';
import { useQuery } from 'react-query';
import { getGraphData } from '../mockData';

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
  return neighbors.length * 50;
};

const GraphContainer = () => {
  const { data } = useQuery('graphData', async () => getGraphData());
  const ref = React.useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditData>({});
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData({});
  };
  const openAddModal = () => {
    setShowEditModal(true);
    setEditData({});
  };
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (!data) return;
    if (!graphRef.current) {
      graphRef.current = new G6.Graph({
        container: ReactDOM.findDOMNode(ref.current) as HTMLElement,
        fitView: true,
        modes: {
          default: ['drag-canvas', 'scroll-canvas', 'zoom-canvas', 'drag-node'],
        },
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'UL',
          controlPoints: true,
          nodesepFunc: ({ id }: { id: string }) =>
            calcSep(graphRef.current as Graph, id),
          ranksepFunc: ({ id }: { id: string }) =>
            calcSep(graphRef.current as Graph, id),
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
            radius: 20,
          },
          labelCfg: {
            style: {
              fontSize: 10,
            },
          },
        },
        plugins: [tooltip],
      });
      graphRef.current.on('node:click', ({ item }) => {
        const itemData = item?.getModel() as any;
        if (!itemData) return;
        setEditData({
          id: itemData.id,
          label: itemData.label,
          model: itemData.data.model,
        });
        setShowEditModal(true);
      });
      graphRef.current.data(data);
      graphRef.current.render();
    } else {
      graphRef.current.changeData(data);
      graphRef.current.refresh();
      setTimeout(() => {
        graphRef.current?.fitView(20);
      });
    }
  }, [data]);
  if (!data) return <h1>Loading...</h1>;
  return (
    <>
      <div
        className={`${styles['graph-container']} ${
          showEditModal ? styles.edit : ''
        }`}
        ref={ref}
      />
      {!showEditModal && (
        <div className={styles['add-button']} onClick={openAddModal}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#ffffff">
            <path d="M12.5 7V0H7.5L7.5 7H0V12H7.5L7.5 20H12.5V12H20V7H12.5Z" />
          </svg>
        </div>
      )}
      {showEditModal && editData && (
        <EditModal {...editData} closeEditModal={closeEditModal} />
      )}
    </>
  );
};

export default GraphContainer;
