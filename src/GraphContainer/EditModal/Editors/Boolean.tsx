import { useCallback, useEffect } from 'react';
import { EditorProps } from 'react-data-grid';
import { ModelRow } from '../../../mockData';
import styles from '../EditModal.module.scss';

const BooleanEditor = ({
  column,
  row,
  onClose,
  onRowChange,
  isCheckbox = false,
}: EditorProps<ModelRow> & {
  isCheckbox?: boolean;
}) => {
  const val = row[column.key];
  const onChange = useCallback(
    () =>
      onRowChange({
        ...row,
        [column.key]: val === 'true' ? 'false' : 'true',
      }),
    [column, row],
  );

  return (
    <div className={styles['boolean-input']}>
      {isCheckbox ? (
        <input
          // onBlur={() => onClose(true)}
          type="checkbox"
          checked={val === 'true'}
          onChange={onChange}
        />
      ) : (
        <button
          onClick={onChange}
          ref={(el) => el?.focus()}
          type="button"
          // onBlur={() => onClose(true)}
        >
          {val}
        </button>
      )}
    </div>
  );
};

export default BooleanEditor;
