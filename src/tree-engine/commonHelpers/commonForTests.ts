import { idProperty } from "../core/coreModels/IElement";

export const testId = Symbol();

export interface ITestDataBase {
  type: 'input' | 'dropdown';
  innerElements: ITestDataBase[]
}

export interface ITestData {
  [idProperty]: number;
  type: 'input' | 'dropdown';
  innerElements: ITestData[];
}

export default () => (
  {
    [idProperty]: 1,
    [testId]: 1,
    type: 'input',
    innerElements: [
      {
        [idProperty]: 3,
        [testId]: 3,
        type: 'input',
        innerElements: [],
      },
      {
        [idProperty]: 4,
        [testId]: 4,
        type: 'input',
        innerElements: [
          {
            [idProperty]: 2,
            [testId]: 2,
            type: 'dropdown',
            innerElements: [
              {
                [idProperty]: 5,
                [testId]: 5,
                type: 'input',
                innerElements: [
                  {
                    [idProperty]: 6,
                    [testId]: 6,
                    type: 'dropdown',
                    innerElements: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
