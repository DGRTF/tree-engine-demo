import { useEffect, useRef } from "react";
import styles from "./Tree.module.css";
import { memo } from "react";
import React from "react";

export interface IProps<TTree extends { readonly innerElements: readonly TTree[] }> {
  tree: TTree;
  onRemoveNode: (node: TTree) => void;
  getNodeId: (node: TTree) => number;
  onChangeElement: (node: TTree) => void;
  getName: (node: TTree) => string;
  onAddElementAsFirstChild: (node: TTree) => void;
}

const Tree = memo(<TTree extends { readonly innerElements: readonly TTree[] }>(props: IProps<TTree>) => {
  const ref = useRef(0);
  ref.current += 1;
  const mainContainerRef = useRef(null as any as HTMLDivElement | null);

  if (mainContainerRef.current)
    mainContainerRef.current.classList.add(styles["node-updated"]);

  setTimeout(() => mainContainerRef.current!.classList.remove(styles["node-updated"]), 1000);

  return (
    <>
      <div className={styles.node}>
        <div ref={mainContainerRef} className={styles.information + " " + styles["node-updated"]}>
          <span>{`Id: ${props.getNodeId(props.tree)} `}</span>
          <span>{`Render: ${ref.current}`}</span>
          <span>{`Name: ${props.getName(props.tree)}`}</span>
          <button onClick={() => props.onRemoveNode(props.tree)}>Remove</button>
          <button onClick={() => props.onChangeElement(props.tree)}>Change</button>
          <button onClick={() => props.onAddElementAsFirstChild(props.tree)}>Add element</button>
        </div>
        {
          props.tree.innerElements.length > 0 ?
            <InnerElementsContainer
              onAddElementAsFirstChild={props.onAddElementAsFirstChild as any}
              getName={props.getName as any}
              onChangeElement={props.onChangeElement as any}
              onRemoveNode={props.onRemoveNode as any}
              getNodeId={props.getNodeId as any}
              innerElements={props.tree.innerElements}
            />
            : null
        }
      </div >
    </>
  );
});

export interface IContainerProps<TTree extends { readonly innerElements: readonly TTree[] }> {
  readonly innerElements: readonly TTree[];
  onRemoveNode: (node: TTree) => void;
  getNodeId: (node: TTree) => number;
  onChangeElement: (node: TTree) => void;
  getName: (node: TTree) => string;
  onAddElementAsFirstChild: (node: TTree) => void;
}

const InnerElementsContainer =
  memo(<TTree extends { readonly innerElements: readonly TTree[] }>(props: IContainerProps<TTree>) => {
    const ref = useRef(0);
    ref.current += 1;
    const mainContainerRef = useRef(null as any as HTMLDivElement | null);

    if (mainContainerRef.current)
      mainContainerRef.current.classList.add(styles["node-updated"]);

    setTimeout(() => mainContainerRef.current!.classList.remove(styles["node-updated"]), 1000);

    return (
      <div ref={mainContainerRef} className={styles["inner-elements"] + " " + styles["node-updated"]}>
        {props.innerElements.map(x =>
          <React.Fragment key={props.getNodeId(x)}>
            <Tree
              onAddElementAsFirstChild={props.onAddElementAsFirstChild as any}
              getName={props.getName as any}
              onChangeElement={props.onChangeElement as any}
              onRemoveNode={props.onRemoveNode as any}
              getNodeId={props.getNodeId as any} tree={x}
            />
          </React.Fragment>)}
      </div>);
  });

export default Tree;
