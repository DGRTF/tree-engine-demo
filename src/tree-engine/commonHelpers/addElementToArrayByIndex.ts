export default function addElementToArrayByIndex<TElement>(
  elements: readonly TElement[],
  newElement: TElement,
  index: number
): TElement[] {
  const newElements = elements.slice();
  newElements.splice(index, 0, newElement);

  return newElements;
}
