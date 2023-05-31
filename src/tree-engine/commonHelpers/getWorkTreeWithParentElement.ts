import { parent, TreeWithIdAndParent } from "../core/coreModels/IElement";

export default <TInputElementType extends { innerElements: TInputElementType[] }>(element: TreeWithIdAndParent<TInputElementType>)
  : TreeWithIdAndParent<TInputElementType> =>
  addParentStructure(element, undefined);

const addParentStructure =
  <TInputElementType extends { innerElements: TInputElementType[] }>
    (element: TreeWithIdAndParent<TInputElementType>, parentElement: TreeWithIdAndParent<TInputElementType> | undefined) => {

    element[parent] = parentElement;
    element.innerElements.forEach(x => addParentStructure(x, element));

    return element;
  }