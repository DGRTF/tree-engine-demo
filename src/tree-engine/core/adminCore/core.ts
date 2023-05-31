import { IInputTreeNode, TreeWithIdAndParent, TreeWithIdReadonly, idProperty, innerElementsPropertyName, parent } from "../coreModels/IElement";
import IValidateError from "./../coreModels/IValidateResult";
import { getEnumerableTreeObjectByPropertyWithMethods } from "../../commonHelpers/elementsTreeToHashMap";
import { addIterableMethodsInArray, addIterableMethodsInObject } from "iterate_library";
import removeElementCommandExecute from "./removeElementCommandExecute";
import editElementCommandExecute from "./editElementCommandExecute";
import addCommandExecute from "./addCommandExecute";
import updateTreeLines from "../../commonHelpers/updateTreeLine";
import { freezeTree, unfreezeTree } from "../../commonHelpers/freezeTree";

export interface IEngine<TInputElementType extends { innerElements: TInputElementType[] }> {
  addElement(newElement: TInputElementType, index: number, parentElementId: number): void;
  changeElement<TChanges extends Exclude<Partial<TInputElementType>, typeof innerElementsPropertyName>>(elementId: number, changes: TChanges);
  getElements(): TreeWithIdReadonly<TInputElementType> | undefined;
}

export default class Engine<TInputElementType extends { innerElements: TInputElementType[] }>
  implements IEngine<TInputElementType> {

  private elementInnerTreeRoot: TreeWithIdAndParent<TInputElementType> | undefined;
  private elementsMap: Map<number, TreeWithIdAndParent<TInputElementType>>;
  private maxId: number = 0;

  constructor(
    treeRoot: TInputElementType,
    private readonly getWorkTreeWithParentElement: (element: TreeWithIdAndParent<TInputElementType>) => TreeWithIdAndParent<TInputElementType>,
    validators: { (treeRoot: TInputElementType): IValidateError | false }[]
  ) {
    this.validateElements(treeRoot, validators);
    const [treeRootWithId, maxId] = this.addIdToElements(treeRoot, 0);
    this.elementInnerTreeRoot = getWorkTreeWithParentElement(treeRootWithId);
    this.maxId = maxId;

    this.elementsMap = this.getMap(this.elementInnerTreeRoot);
  }

  private getMap<TInputElementType extends { innerElements: TInputElementType[]; }>(root: TreeWithIdAndParent<TInputElementType>) {
    return getEnumerableTreeObjectByPropertyWithMethods(root, x => x.innerElements)
      .enumerableToMap(x => x[idProperty], x => x);
  }

  private addIdToElements<TInputElementType extends IInputTreeNode<TInputElementType>>(treeRoot: TInputElementType, idFrom: number) {
    let id = idFrom;

    getEnumerableTreeObjectByPropertyWithMethods(treeRoot, x => x.innerElements)
      .enumerableForEach((x) => {
        id++;
        x[idProperty] = id;
        x[parent] = undefined;
      });

    return [treeRoot as any as TreeWithIdAndParent<TInputElementType>, id] as const;
  }

  private validateElements(elements: TInputElementType, validators: readonly { (treeRoot: TInputElementType): IValidateError | false }[]): void {
    validators.forEach(validator => {
      const validateResult = validator(elements);

      if (validateResult)
        throw new Error(validateResult.errorMessage);
    });
  }

  private addCommands: {
    newElement: TInputElementType,
    indexToInsert: number;
    parentElementId: number;
  }[] = [];

  addElement(newElement: TInputElementType, indexToInsert: number, parentElementId: number) {
    this.getElementFromCollection(parentElementId);
    // newElement.innerElements = newElement.innerElements ?? throw new Error();

    if (indexToInsert < 0)
      throw new Error('Index should be greater than zero');

    this.addCommands.push({
      newElement,
      indexToInsert,
      parentElementId,
    });
  }

  private readonly editCommands = new Map<number, Exclude<Partial<TInputElementType>, typeof innerElementsPropertyName>[]>();

  changeElement<TChanges extends Exclude<Partial<TInputElementType>, typeof innerElementsPropertyName>>(elementId: number, changes: TChanges) {
    if (innerElementsPropertyName in changes)
      throw new Error(`You need use method for add of element to change ${innerElementsPropertyName} property`);

    this.getElementFromCollection(elementId);
    const editCommand = this.editCommands.get(elementId);

    editCommand ?
      editCommand.push(changes) :
      this.editCommands.set(elementId, [changes]);
  }

  private readonly removeElementsIds = new Set<number>();

  removeElement(elementId: number) {
    this.getElementFromCollection(elementId);
    this.removeElementsIds.add(elementId);
  }

  getElements(): TreeWithIdReadonly<TInputElementType> | undefined {
    if (this.elementInnerTreeRoot)
      unfreezeTree(this.elementInnerTreeRoot);

    this.executeCommands();
    this.buildTree();

    if (this.elementInnerTreeRoot)
      freezeTree(this.elementInnerTreeRoot);

    return this.elementInnerTreeRoot as any as TreeWithIdReadonly<TInputElementType>;
  }

  private executeCommands() {
    this.addCommands = this.addCommands.filter(x => !this.removeElementsIds.has(x.parentElementId));
    this.removeElementsIds.forEach(x => this.editCommands.delete(x));

    this.executeRemoveCommands();
    this.executeEditCommands();
    this.executeAddCommands();
  }

  private executeRemoveCommands() {
    removeElementCommandExecute(this.removeElementsIds, this.getElementFromCollection.bind(this)) ?
      this.elementInnerTreeRoot = undefined :
      null;

    this.elementsToUpdate.push(...this.addElementToUpdate(this.removeElementsIds));

    addIterableMethodsInObject<Set<number>, number, "enumerable">(this.removeElementsIds)
      .enumerableMap(x =>
        getEnumerableTreeObjectByPropertyWithMethods(this.elementsMap.get(x)!, x => x.innerElements)
          .enumerableMap(x => x[idProperty])
          .enumerableToSet()
      )
      .enumerableFlatMap(x => x)
      .enumerableForEach(x => this.elementsMap.delete(x as any));

    this.removeElementsIds.clear();
  }

  private addElementToUpdate(idsToUpdate: Iterable<number>) {
    return addIterableMethodsInObject<Iterable<number>, number, "enumerable">(idsToUpdate)
      .enumerableMap(x => this.elementsMap.get(x)?.[parent])
      .enumerableFilterStrict(x => x !== undefined)
      .enumerableToArray() as Iterable<TreeWithIdAndParent<TInputElementType>>
  }

  private executeEditCommands() {
    const result = editElementCommandExecute(this.editCommands,
      x => this.elementsMap.get(x));

    // update elements in a map
    result.forEach(x => {
      if (x[idProperty] === this.elementInnerTreeRoot?.[idProperty])
        this.elementInnerTreeRoot = x;

      this.elementsMap.set(x[idProperty], x);
    })

    this.elementsToUpdate.push(...this.addElementToUpdate(this.editCommands.keys()));
    this.editCommands.clear();
  }

  private executeAddCommands() {
    const convertedCommands = this.addCommands
      .map(x => {
        const [treeRootWithId, maxId] = this.addIdToElements(x.newElement, this.maxId);
        this.maxId = maxId;

        return {
          ...x,
          newElement: this.getWorkTreeWithParentElement(treeRootWithId),
        };
      });

    addCommandExecute(convertedCommands, x => this.elementsMap.get(x));

    this.elementsMap = addIterableMethodsInArray(convertedCommands)
      .enumerableMap(x => x.newElement)
      .enumerableConcat(this.elementsMap.values())
      .enumerableToMap(x => x[idProperty], x => x);

    this.elementsToUpdate.push(...this.addElementToUpdate(convertedCommands.map(x => x.newElement[idProperty])));

    this.addCommands.length = 0;
  }

  private elementsToUpdate: TreeWithIdAndParent<TInputElementType>[] = [];

  private buildTree() {
    const root = updateTreeLines(this.elementsToUpdate);
    this.elementsToUpdate.length = 0;

    if (root)
      this.elementInnerTreeRoot = root;

    if (!this.elementInnerTreeRoot)
      this.elementsMap.clear();
    else
      this.elementsMap = this.getMap(this.elementInnerTreeRoot);

    return this.elementInnerTreeRoot;
  }

  private getElementFromCollection<TElementType extends IInputTreeNode<TElementType>>(elementId: number) {
    const element = this.elementsMap.get(elementId);

    if (element === undefined)
      throw new Error(`Element with id ${elementId} not found`);

    return element;
  }
}
