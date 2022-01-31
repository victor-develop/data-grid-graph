import { EditorProps } from 'react-data-grid';
import { ModelRow } from '../EditModal';
import styles from '../EditModal.module.scss';

const BooleanEditor = ({
  column,
  row,
  onClose,
  onRowChange,
}: EditorProps<ModelRow>) => {
  const val = row[column.key];
  return (
    <div className={styles['boolean-input']}>
      <button
        onClick={() =>
          onRowChange({
            ...row,
            [column.key]: val === 'true' ? 'false' : 'true',
          })
        }
        ref={(el) => el?.focus()}
        type="button"
        onBlur={() => onClose(true)}
      >
        {val}
      </button>
    </div>
  );
};

export default BooleanEditor;
