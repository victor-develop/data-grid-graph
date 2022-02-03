import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './EditModal.module.scss';
import DataGrid, { Column } from 'react-data-grid';
import editorsMap, { EditorTypes } from './Editors';
import Modal from '../../components/Modal/Modal';
import ColumnModal from './ColumnModal/ColumnModal';
import { useMutation, useQuery } from 'react-query';
import {
  addEdges,
  addModel,
  editModel,
  getGraphData,
  IModel,
  ModelRow,
} from '../../mockData';
import { queryClient } from '../../queryClient';
import { fieldsToColumns } from './utils';
import SyncModal from './SyncModal/SyncModal';

export interface EditData {
  id?: string;
  label?: string;
  model?: IModel;
}

export interface ColumnWithType<T> extends Column<T> {
  data?: {
    type: EditorTypes;
  };
}
type IEdgePayload = Parameters<typeof addEdges>[0];

const defaultColumns = (
  [
    {
      key: 'Field Key',
      type: 'string',
    },
    {
      key: 'Type',
      type: 'string',
    },
    {
      key: 'Nullable',
      type: 'boolean',
    },
  ] as { key: string; type: EditorTypes }[]
).map(
  ({ key, type }) =>
    ({
      key,
      name: key,
      editor: editorsMap[type],
      editorOptions: {
        editOnClick: true,
      },
      data: {
        type,
      },
    } as ColumnWithType<ModelRow>),
);

const EditModal = ({
  id,
  model,
  label,
  closeEditModal,
}: EditData & { closeEditModal: () => void }) => {
  const { data: nodeIdLabelMap } = useQuery(
    ['graphData', 'nodeIdLabelMap'],
    async () => getGraphData(),
    {
      select: (data) => {
        const map = new Map();
        data.nodes.forEach((node) => map.set(node.id, node.label));
        return map;
      },
    },
  );
  const afterMutation = {
    onSuccess: () => queryClient.invalidateQueries('graphData'),
  };
  const addEdgesMutation = useMutation(async (data: IEdgePayload) => {
    return addEdges(data);
  }, afterMutation);
  const editModelMutation = useMutation(
    async (data: { id: string; label: string; model: IModel }) => {
      return editModel(data);
    },
    afterMutation,
  );
  const addModelMutation = useMutation(
    async (data: { label: string; model: IModel }) => {
      return addModel(data);
    },
    afterMutation,
  );
  const [modelLabel, setModelLabel] = useState(label ?? '');
  const [rows, setRows] = useState<ModelRow[]>(
    model?.rows ?? [
      {
        Type: 'string',
        Nullable: 'false',
      },
    ],
  );
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const formattedColumns = useMemo(() => {
    if (!model) return;
    return fieldsToColumns(model.fields);
  }, [id, model]);
  const [columns, setColumns] = useState<ColumnWithType<ModelRow>[]>(
    formattedColumns ?? defaultColumns,
  );
  useEffect(() => {
    if (columns.find(({ key }) => key === '__sourceModel__')) return;
    rows.find((row) => {
      if (row.__sourceModel__) {
        setColumns((prev) => [
          {
            key: '__sourceModel__',
            name: 'Source Model',
          },
          ...prev,
        ]);
        return true;
      }
      return false;
    });
  }, [rows]);

  const onSubmit = useCallback(async () => {
    if (!modelLabel) return;
    const fields: Record<string, EditorTypes> = {};
    columns.forEach(({ key, data }) => {
      if (data) fields[key] = data.type;
    });

    if (id) {
      // Edit
      editModelMutation.mutate({
        id,
        label: modelLabel,
        model: {
          fields,
          rows,
        },
      });
    } else {
      // Add
      const newModel = await addModelMutation.mutateAsync({
        label: modelLabel,
        model: {
          fields,
          rows,
        },
      });
      const newEdges: IEdgePayload = rows
        .filter((row) => row.__sourceModel__ !== 'null')
        .reduce((acc, cur) => {
          if (!cur.__sourceModel__) return acc;
          if (
            acc.length === 0 ||
            acc[acc.length - 1].source !== cur.__sourceModel__
          ) {
            acc.push({
              source: cur.__sourceModel__,
              target: newModel.id,
            });
          }
          return acc;
        }, []) as any;
      addEdgesMutation.mutate(newEdges);
    }
    closeEditModal();
  }, [columns, modelLabel, rows]);
  const [expandedGroupIds, setExpandedGroupIds] = useState(new Set());
  return (
    <Modal
      onClose={closeEditModal}
      header={
        <div className={styles['header']}>
          {id ? 'Edit' : 'Add'} Model:{' '}
          <input
            value={modelLabel}
            onChange={(e) => setModelLabel(e.target.value)}
          />
        </div>
      }
      cancelButton={{
        onClick: closeEditModal,
      }}
      saveButton={{
        onClick: onSubmit,
        isDisabled: useMemo(
          () => columns.length === 0 || rows.length === 0 || !modelLabel,
          [columns, rows, modelLabel],
        ),
      }}
    >
      <DataGrid
        columns={columns}
        rows={rows}
        groupBy={['__sourceModel__']}
        expandedGroupIds={expandedGroupIds}
        onExpandedGroupIdsChange={setExpandedGroupIds}
        rowGrouper={(rows) => {
          const sourceModels: Record<string, ModelRow[]> = {
            null: [],
          };
          rows.forEach((row) => {
            if (!('__sourceModel__' in row))
              return sourceModels['null'].push(row);
            const label = nodeIdLabelMap?.get(row.__sourceModel__);
            if (sourceModels[label]) {
              sourceModels[label].push(row);
            } else {
              sourceModels[label] = [row];
            }
          });
          return sourceModels;
        }}
        onRowsChange={setRows}
      />
      <div className={styles['control']}>
        <button
          style={{ backgroundColor: '#39c3ff' }}
          onClick={() => setShowSyncModal(true)}
        >
          Sync from model
        </button>
        <button onClick={() => setRows((prev) => [...prev, {}])}>
          Add row
        </button>
        <button onClick={() => setShowColumnModal(true)}>Add column</button>
      </div>
      {showSyncModal && (
        <SyncModal
          setColumns={setColumns}
          submitRows={setRows}
          onClose={() => setShowSyncModal(false)}
        />
      )}
      {showColumnModal && (
        <ColumnModal
          setColumns={setColumns}
          onClose={() => setShowColumnModal(false)}
        />
      )}
    </Modal>
  );
};

export default EditModal;
