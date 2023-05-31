import { IInputTreeNode, parent, TreeWithIdAndParent, idProperty } from "../coreModels/IElement";

export default <TElementType extends IInputTreeNode<TElementType>>(elementsIds: Readonly<Set<number>>,
  getElement: (elementId: number) => TreeWithIdAndParent<TElementType>): boolean => {

  let needToDeleteRootElement = false;
  elementsIds.forEach(x => removeElement(x, getElement) ? needToDeleteRootElement = true : null);

  return needToDeleteRootElement;
}

const removeElement = <TElementType extends IInputTreeNode<TElementType>>
  (elementId: number, getElement: (elementId: number) => TreeWithIdAndParent<TElementType>): boolean => {

  const element = getElement(elementId);

  if (element[parent] === undefined)
    return true;

  removeElementFromParentCollection(element[parent], element[idProperty]);

  return false;
}

const removeElementFromParentCollection =
  <TElementType extends IInputTreeNode<TElementType>>
    (parentElement: TreeWithIdAndParent<TElementType>, childElementId: number) => {
    parentElement.innerElements = parentElement.innerElements.filter(x => x[idProperty] !== childElementId);
  }