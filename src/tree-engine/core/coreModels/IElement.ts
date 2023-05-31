export interface IInputTreeNode<TElementType extends IInputTreeNode<TElementType>> {
  innerElements: TElementType[];
}

export const idProperty = Symbol();
export const innerElementsPropertyName = 'innerElements';
export const parent = Symbol();

export type TreeWithIdAndParent<TType extends { innerElements: TType[] }> =
  {
    [key in keyof TType as key extends typeof innerElementsPropertyName ? never : key]: TType[key];
  }
  &
  {
    [parent]: TreeWithIdAndParent<TType> | undefined;
    readonly [idProperty]: number;
    innerElements: readonly TreeWithIdAndParent<TType>[];
  };

export type TreeWithIdReadonly<TType> =
  {
    [key in keyof TType as key extends typeof innerElementsPropertyName ? never : key]: TType[key];
  }
  &
  {
    readonly [idProperty]: number;
    readonly innerElements: readonly TreeWithIdReadonly<TType>[];
  };
