import { EditorProps } from 'react-data-grid';
import { ModelRow } from '../../../mockData';
import styles from '../EditModal.module.scss';

const TextEditor = ({
  column,
  row,
  onClose,
  onRowChange,
}: EditorProps<ModelRow>) => {
  return (
    <input
      className={styles['text-input']}
      ref={(el) => el?.focus()}
      value={row[column.key] ?? ''}
      onChange={(event) =>
        onRowChange({ ...row, [column.key]: event.target.value })
      }
      onBlur={() => onClose(true)}
    />
  );
};

export default TextEditor;
