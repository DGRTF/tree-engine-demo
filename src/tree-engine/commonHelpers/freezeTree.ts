import { innerElementsPropertyName, parent } from "../core/coreModels/IElement";

const passedObjects = new Set<{}>();

export function freezeTree
  <TElementType extends {}>(root: TElementType) {

  freeze(root);
  passedObjects.clear();
}

const freeze =
  <TElementType extends {}>(root: TElementType) => {
    if (passedObjects.has(root))
      return;

    passedObjects.add(root);

    [...Object.keys(root), ...Object.getOwnPropertySymbols(root)]
      .forEach(key => {
        if (key === innerElementsPropertyName)
          Object.freeze(root[key]);

        Object.defineProperty(root, key, {
          writable: false
        });

        const typeOfKey = typeof root[key];

        if (typeOfKey === "object" || typeOfKey === "function")
          freeze(root[key] as any);
      });
  }

export function unfreezeTree
  <TElementType extends {}>(root: TElementType) {
  unfreeze(root);
  passedObjects.clear();
}

const unfreeze = <TElementType extends {}>(root: TElementType) => {
  if (passedObjects.has(root))
    return;

  passedObjects.add(root);

  [...Object.keys(root), ...Object.getOwnPropertySymbols(root)]
    .forEach(key => {
      if (key === innerElementsPropertyName || key === parent)
        Object.defineProperty(root, key, {
          writable: true
        });

      const typeOfKey = typeof root[key];

      if (typeOfKey === "object" || typeOfKey === "function")
        unfreeze(root[key] as any);
    });
}
