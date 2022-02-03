import { EdgeConfig, GraphData, NodeConfig } from '@antv/g6';
import { EditorTypes } from './GraphContainer/EditModal/Editors';
import { v4 } from 'uuid';
export type ModelRow = Record<string, any>;
export interface IModel {
  fields: Record<string, EditorTypes>;
  rows: ModelRow[];
}
export interface IEdge extends EdgeConfig {
  id: string;
  label: string;
  data: string[];
}
export interface INode extends NodeConfig {
  data: {
    model: IModel;
  };
}

interface Data extends GraphData {
  nodes: INode[];
  edges: IEdge[];
}

const defaultIdLabelMap = {
  order: v4(),
  return: v4(),
  fulfillment: v4(),
  tracking: v4(),
  test1: v4(),
};

const nodeMap: Map<string, INode> = new Map();
nodeMap.set(defaultIdLabelMap['order'], {
  id: defaultIdLabelMap['order'],
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
});
nodeMap.set(defaultIdLabelMap['return'], {
  id: defaultIdLabelMap['return'],
  label: 'return',
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
          __sourceModel__: defaultIdLabelMap['order'],
          'Field Key': 'order_id',
          'PII(Personal Identifiable Information)': 'false',
          Type: 'string',
          Nullable: 'false',
        },
      ],
    },
  },
});
nodeMap.set(defaultIdLabelMap['fulfillment'], {
  id: defaultIdLabelMap['fulfillment'],
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
          __sourceModel__: defaultIdLabelMap['order'],
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
});
nodeMap.set(defaultIdLabelMap['tracking'], {
  id: defaultIdLabelMap['tracking'],
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
          __sourceModel__: defaultIdLabelMap['fulfillment'],
          'Field Key': 'order_id',
          'PII(Personal Identifiable Information)': 'false',
          Type: 'string',
          Nullable: 'false',
        },
        {
          __sourceModel__: defaultIdLabelMap['fulfillment'],
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
});
// nodeMap.set(defaultIdLabelMap['test1'], {
//   id: defaultIdLabelMap['test1'],
//   label: 'test1',
//   data: {
//     model: {
//       fields: {
//         'Field Key': 'string',
//         'PII(Personal Identifiable Information)': 'boolean',
//         Type: 'string',
//         Nullable: 'boolean',
//       },
//       rows: [
//         {
//           'Field Key': 'test_id',
//           'PII(Personal Identifiable Information)': 'false',
//           Type: 'string',
//           Nullable: 'false',
//         },
//         {
//           __sourceModel__: defaultIdLabelMap['order'],
//           'Field Key': 'order_id',
//           'PII(Personal Identifiable Information)': 'false',
//           Type: 'string',
//           Nullable: 'false',
//         },
//         {
//           __sourceModel__: defaultIdLabelMap['order'],
//           'Field Key': 'fulfillment_id',
//           'PII(Personal Identifiable Information)': 'true',
//           Type: 'string',
//           Nullable: 'false',
//         },
//       ],
//     },
//   },
// });

const edges: Omit<IEdge, 'data' | 'label'>[] = [
  {
    id: v4(),
    source: defaultIdLabelMap['order'],
    target: defaultIdLabelMap['fulfillment'],
  },
  {
    id: v4(),
    source: defaultIdLabelMap['fulfillment'],
    target: defaultIdLabelMap['tracking'],
  },
  {
    id: v4(),
    source: defaultIdLabelMap['order'],
    target: defaultIdLabelMap['return'],
  },
  // {
  //   id: v4(),
  //   source: defaultIdLabelMap['order'],
  //   target: defaultIdLabelMap['test1'],
  // },
];

export const getGraphData = (): Data => {
  return {
    nodes: [...nodeMap.values()],
    edges: edges.map((edge: any) => {
      const sourceRows =
        nodeMap.get(edge.target)?.data.model.rows.filter((row) => {
          return row.__sourceModel__ === edge.source;
        }) ?? [];
      return {
        ...edge,
        label: sourceRows.map((row) => row['Field Key']).join(', '),
        data: sourceRows.map((row) => `${row['Field Key']}()`),
      };
    }),
  };
};

export const addModel = ({
  label,
  model,
}: {
  label: string;
  model: IModel;
}) => {
  const newModel = {
    id: v4(),
    label,
    data: {
      model,
    },
  };
  nodeMap.set(newModel.id, newModel);
  return newModel;
};

export const editModel = ({
  id,
  label,
  model,
}: {
  id: string;
  label: string;
  model: IModel;
}) => {
  const newModel = {
    id,
    label,
    data: {
      model,
    },
  };
  nodeMap.set(id, newModel);
  return newModel;
};

export const addEdges = (
  newEdges: {
    source: string;
    target: string;
  }[],
) => {
  const edgesWithId = newEdges.map((edge) => ({ ...edge, id: v4() }));
  edges.push(...edgesWithId);
  return edgesWithId;
};
