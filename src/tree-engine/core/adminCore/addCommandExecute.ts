import addElementToArrayByIndex from "../../commonHelpers/addElementToArrayByIndex";
import { parent, IInputTreeNode, TreeWithIdAndParent } from "../coreModels/IElement";

export interface IAddCommand<TElementType extends IInputTreeNode<TElementType>> {
  readonly newElement: TreeWithIdAndParent<TElementType>;
  readonly indexToInsert: number;
  readonly parentElementId: number;
}

export default <TElementType extends IInputTreeNode<TElementType>>(newElements: readonly IAddCommand<TElementType>[],
  getElement: (elementId: number) => TreeWithIdAndParent<TElementType> | undefined) =>
  newElements.forEach(x => addElementToTree(x, getElement));

const addElementToTree = <TElementType extends IInputTreeNode<TElementType>>(addCommand: IAddCommand<TElementType>,
  getElement: (elementId: number) => TreeWithIdAndParent<TElementType> | undefined) => {

  const parentElement = getElement(addCommand.parentElementId);

  if (!parentElement)
    return;

  checkParentInnerElementsLength(addCommand.indexToInsert, parentElement.innerElements);

  parentElement.innerElements = addElementToArrayByIndex(
    parentElement.innerElements,
    addCommand.newElement,
    addCommand.indexToInsert);

  addCommand.newElement[parent] = parentElement;
}

const checkParentInnerElementsLength = <TItem>(index: number, parentContainer: readonly TItem[]) => {
  if (index > parentContainer.length)
    throw new Error('Index was be greater than parent container length');
}
