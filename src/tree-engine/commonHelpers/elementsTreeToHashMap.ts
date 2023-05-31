import { addIterableMethodsInObject } from "iterate_library";

export default <TElement extends { innerElements: readonly TElement[] }>(element: TElement) => {
  const iterateTreeObject = getEnumerableTreeObjectByProperty(element, x => x.innerElements);

  return addIterableMethodsInObject(iterateTreeObject);
}

export const getEnumerableTreeObjectByPropertyWithMethods = <TElement extends {}>(element: TElement, getChild: (element: TElement) => readonly TElement[] | null) => {
  return addIterableMethodsInObject<Iterable<TElement>, TElement>(getEnumerableTreeObjectByProperty(element, getChild));
}

export const getEnumerableTreeObjectByProperty = <TElement extends {}>(element: TElement, getChild: (element: TElement) => readonly TElement[] | null) =>
({
  *[Symbol.iterator](): Generator<TElement, void, undefined> {
    yield* this.get(element);
  },
  *get(element: TElement): Generator<TElement, void, undefined> {
    yield element;

    for (const item of getChild(element) ?? []) {
      yield* this.get(item);
    }
  },
});
