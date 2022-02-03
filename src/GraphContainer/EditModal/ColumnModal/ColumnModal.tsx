import React, { useMemo, useState } from 'react';
import { Column } from 'react-data-grid';
import Modal from '../../../components/Modal';
import { IModel, ModelRow } from '../../../mockData';
import { ColumnWithType } from '../EditModal';
import styles from '../EditModal.module.scss';
import editorsMap, { EditorTypes } from '../Editors';

const ColumnModal = ({
  onClose,
  data,
  setColumns,
}: {
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithType<ModelRow>[]>>;
  onClose: () => void;
  data?: {
    name: string;
    type: EditorTypes;
  };
}) => {
  const [colName, setColName] = useState(data?.name ?? '');
  const [colType, setColType] = useState<EditorTypes>(data?.type ?? 'string');
  const renderColType = (value: EditorTypes) => (
    <div key={value}>
      <input
        type="radio"
        name="column-type"
        value={value}
        id={value}
        checked={colType === value}
        onChange={() => setColType(value)}
      />
      <label
        htmlFor={value}
        style={{ padding: '5px 0px', display: 'inline-block' }}
      >
        {value}
      </label>
    </div>
  );
  return (
    <Modal
      header={
        <div className={styles['header']}>
          {data?.name ? 'Edit' : 'Add'} Column:{' '}
          <input value={colName} onChange={(e) => setColName(e.target.value)} />
        </div>
      }
      fullSize={false}
      onClose={onClose}
      saveButton={{
        onClick: () => {
          setColumns((prev) => [
            ...prev,
            {
              key: colName,
              name: colName,
              editable: true,
              editor: editorsMap[colType],
              editorOptions: {
                editOnClick: true,
              },
              data: {
                type: colType,
              },
            },
          ]);
          onClose();
        },
        isDisabled: useMemo(() => {
          if (!colType || !colName) return true;
          return (
            colType === (data?.type ?? '') && colName === (data?.type ?? '')
          );
        }, [colType, colName, data]),
      }}
      cancelButton={{
        onClick: onClose,
      }}
    >
      <h2>Column type</h2>
      {(['string', 'boolean'] as EditorTypes[]).map((val) =>
        renderColType(val),
      )}
    </Modal>
  );
};

export default ColumnModal;
