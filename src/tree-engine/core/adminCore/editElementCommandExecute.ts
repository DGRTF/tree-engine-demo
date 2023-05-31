import { IInputTreeNode, idProperty, parent, TreeWithIdReadonly, TreeWithIdAndParent } from "../coreModels/IElement";

export default
  <TElementType extends IInputTreeNode<TElementType>, TObjectToEdit extends {}>(
    editCommands: Readonly<Map<number, readonly TObjectToEdit[]>>,
    getElement: (elementId: number) => TreeWithIdAndParent<TElementType> | undefined) => {

    const changedElements: TreeWithIdAndParent<TElementType>[] = [];

    for (const changes of editCommands) {
      const element = getElement(changes[0]);

      if (!element)
        continue;

      const newElement = changes[1].reduce((x: TreeWithIdAndParent<TElementType>, y) => ({ ...x, ...y }), element);
      newElement.innerElements.forEach(x => x[parent] = newElement);
      changedElements.push(newElement);

      if (element[parent])
        changeOldElementToNewEditElementInParentCollection(element, newElement);

    };

    return changedElements;
  }

const changeOldElementToNewEditElementInParentCollection =
  <TElementType extends IInputTreeNode<TElementType>>
    (element: TreeWithIdAndParent<TElementType>,
      newElement: TreeWithIdAndParent<TElementType>) => {

    // const index = 
    element[parent]!.innerElements = element[parent]!.innerElements.map(x => x[idProperty] === newElement[idProperty] ? newElement : x);
    // element[parent]!.innerElements[index] = newElement;
  }
