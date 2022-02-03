import { EditorProps } from 'react-data-grid';
import { ModelRow } from '../../../mockData';
import BooleanEditor from './Boolean';
import TextEditor from './Text';

export type EditorTypes = 'string' | 'boolean';
const editorsMap: Record<EditorTypes, (props: any) => JSX.Element> = {
  string: TextEditor,
  boolean: BooleanEditor,
};

export default editorsMap;
