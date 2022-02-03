import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import Modal from '../../../components/Modal';
import { getGraphData, ModelRow } from '../../../mockData';
import styles from '../EditModal.module.scss';
import { fieldsToColumns } from '../utils';
import DataGrid, { Column, RowRendererProps, Row } from 'react-data-grid';
import { ColumnWithType } from '../EditModal';

interface ModelRowSelected extends ModelRow {
  __selected__: string;
}

const SyncModal = ({
  onClose,
  submitRows,
  setColumns,
}: {
  onClose: () => void;
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithType<ModelRow>[]>>;
  submitRows: React.Dispatch<React.SetStateAction<ModelRow[]>>;
}) => {
  const { data } = useQuery(['graphData', 'nodes'], async () => {
    const { nodes } = getGraphData();
    return nodes;
  });
  const [targetModelId, setTargetModelId] = useState('');
  const [rows, setRows] = useState<ModelRowSelected[]>([]);
  const { columns } = useMemo(() => {
    if (!data || !targetModelId) return { formattedRows: [], columns: [] };
    const index = data.findIndex((it) => it.id === targetModelId);
    const item = data[index].data.model;
    const res: any = {};
    Object.keys(item.fields).forEach((key) => {
      res[key] = false;
    });
    const formattedRows = item.rows.map((row) => ({
      __selected__: 'false',
      ...row,
    }));
    setRows(formattedRows);
    return {
      columns: [
        {
          key: '__selected__',
          name: 'Selected',
          formatter: ({ row }) => (
            <div className={styles['boolean-input']}>
              <input
                type="checkbox"
                checked={row.__selected__ === 'true'}
                onChange={() => {}}
              />
            </div>
          ),
          data: {
            type: 'boolean',
          },
        } as Column<ModelRowSelected>,
        ...fieldsToColumns(item.fields, false),
      ] as Column<ModelRowSelected>[],
    };
  }, [data, targetModelId]);
  const rowRenderer = (props: RowRendererProps<ModelRowSelected>) => {
    return (
      <Row
        className={`${styles['row-wrap']} ${
          props.row.__selected__ === 'true' ? styles['selected'] : ''
        }`}
        {...props}
      />
    );
  };
  return (
    <Modal
      header={<div className={styles['header']}>Sync fields</div>}
      fullSize={false}
      onClose={onClose}
      saveButton={{
        onClick: () => {
          submitRows((prev) => [
            ...prev,
            ...rows
              .filter((it) => it.__selected__ === 'true')
              .map(({ __selected__, ...rest }) => ({
                ...rest,
                __sourceModel__: targetModelId,
              })),
          ]);
          setColumns((prev) => {
            // if __sourceModel__ column exists return prev
            if (prev.find((col) => col.key === '__sourceModel__')) return prev;
            // add __sourceModel__ column
            return [
              {
                key: '__sourceModel__',
                name: 'Source Model',
              },
              ...prev,
            ];
          });
          onClose();
        },
        isDisabled: useMemo(
          () => !data || !targetModelId,
          [targetModelId, data],
        ),
      }}
      cancelButton={{
        onClick: onClose,
      }}
    >
      {data ? (
        <>
          <div className={styles['select-model']}>
            <h2>Model: </h2>
            <select
              value={targetModelId}
              onChange={(e) => setTargetModelId(e.target.value)}
            >
              <option value="">Select a model</option>
              {data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <DataGrid
            columns={columns}
            rows={rows}
            rowRenderer={rowRenderer}
            onRowClick={(row) => {
              setRows((prev) =>
                prev.map((it) => {
                  if (it['Field Key'] !== row['Field Key']) return it;
                  return {
                    ...it,
                    __selected__: it.__selected__ === 'true' ? 'false' : 'true',
                  };
                }),
              );
            }}
            onRowsChange={setRows}
          />
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </Modal>
  );
};

export default SyncModal;
