import React, { useCallback, useMemo, useState } from 'react';
import styles from './EditModal.module.scss';
import DataGrid, { Column } from 'react-data-grid';
import editorsMap, { EditorTypes } from './Editors';

export type ModelRow = Record<string, string | boolean>;

export interface DataModel {
  fields: Record<string, EditorTypes>;
  rows: ModelRow[];
}

export interface EditData {
  id: string;
  model: DataModel;
}

const EditModal = ({
  id,
  model,
  closeEditModal,
}: EditData & { closeEditModal: () => void }) => {
  const [rows, setRows] = useState(model.rows);
  const columns = useMemo(() => {
    const cols: Column<ModelRow>[] = [];
    for (let key in model.fields) {
      cols.push({
        key,
        name: key,
        editor: editorsMap[model.fields[key]],
        editorOptions: {
          editOnClick: true,
        },
      });
    }

    return cols;
  }, [id, model]);
  return (
    <>
      <div className={styles['overlay']} onClick={closeEditModal}></div>
      <div className={styles['edit-modal']}>
        <div className={styles['close-button']} onClick={closeEditModal}>
          X
        </div>
        <div className={styles['header']}>
          Edit Model: <span>{id}</span>
        </div>
        <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />
      </div>
    </>
  );
};

export default EditModal;
