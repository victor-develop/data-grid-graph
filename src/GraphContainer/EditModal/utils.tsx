import { ModelRow } from '../../mockData';
import { ColumnWithType } from './EditModal';
import editorsMap, { EditorTypes } from './Editors';

export const fieldsToColumns = (
  fields: Record<string, EditorTypes>,
  editable = true,
): ColumnWithType<ModelRow>[] => {
  const cols: ColumnWithType<ModelRow>[] = [];
  for (let key in fields) {
    cols.push({
      key,
      name: key,
      ...(editable
        ? {
            editor: editorsMap[fields[key]],
            editorOptions: {
              editOnClick: true,
            },
          }
        : {}),
      data: {
        type: fields[key],
      },
    });
  }

  return cols;
};
