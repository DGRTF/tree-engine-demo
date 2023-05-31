import React, { useCallback, useRef, useState } from 'react';
import styles from './App.module.css';
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import Tree from './pages/Tree';
import Engine from './tree-engine/core/adminCore/core';
import getWorkTreeWithParentElement from './tree-engine/commonHelpers/getWorkTreeWithParentElement';
import { TreeWithIdReadonly, idProperty } from './tree-engine/core/coreModels/IElement';

const treePath = "tree";

interface ITree {
  name: string;
  innerElements: ITree[]
}

const getNewElement = () => ({
  name: crypto.randomUUID().substring(0, 5),
  innerElements: [],
});

const treeEngine = new Engine<ITree>(getNewElement(), getWorkTreeWithParentElement, []);
const getNodeId = (node: TreeWithIdReadonly<ITree>) => node[idProperty];
const getNodeName = (node: TreeWithIdReadonly<ITree>) => node.name;
const onAddElementAsFirstChild = (node: TreeWithIdReadonly<ITree>) => treeEngine.addElement(getNewElement(), 0, node[idProperty]);

/**
 * Base component
 */
export default function App() {
  const [tree, setTree] = useState(treeEngine.getElements());

  const insertData = useRef({
    parentElementIndex: 0,
    indexToInsert: 0,
  });

  const removeNode = useCallback((node: TreeWithIdReadonly<ITree>) => {
    treeEngine.removeElement(node[idProperty]);
  }, []);

  const changeElement = useCallback((node: TreeWithIdReadonly<ITree>) =>
    treeEngine.changeElement(node[idProperty], { name: crypto.randomUUID().substring(0, 5) }),
    []);

  const addElement = () => {
    if (insertData.current.parentElementIndex) {
      treeEngine.addElement(
        getNewElement(),
        insertData.current.indexToInsert,
        insertData.current.parentElementIndex);
    }
  }

  // @ts-ignore
  return (
    <div className={styles.App}>
      <BrowserRouter>
        {/*@ts-ignore */}
        <Routes>
          {/*@ts-ignore */}
          <Route path="/" element={<Layout />}>
            {/*@ts-ignore */}
            <Route path={treePath} element={<>
              <div>
                <label>
                  Parent element id
                  <input
                    onChange={(x) => insertData.current.parentElementIndex = Number(x.currentTarget.value)}
                    type="number"
                  />
                </label>
                <label>
                  Index to insert
                  <input onChange={(x) => insertData.current.indexToInsert = Number(x.currentTarget.value)} type="number" />
                </label>
                <button onClick={addElement}>Add Element</button>
                <button onClick={() => setTree(treeEngine.getElements())} >Build tree</button>
              </div>
              {tree ?
                <Tree
                  getName={getNodeName as any}
                  onChangeElement={changeElement as any}
                  onRemoveNode={removeNode as any}
                  onAddElementAsFirstChild={onAddElementAsFirstChild as any}
                  tree={tree}
                  getNodeId={getNodeId as any}
                /> :
                null}
            </>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            {/*@ts-ignore */}
            <Link to={`/${treePath}`}>Tree</Link>
          </li>
        </ul>
      </nav >

      {/*@ts-ignore */}
      <Outlet />
    </>
  )
};
