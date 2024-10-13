import { DraggableData, Rnd } from "react-rnd";
import { Element } from "./Whiteboard";
import { ReactElement } from "react";

export default function Item(props: {
        e: Element,
        onDrag: (_: any, d: DraggableData) => void
        onResize: (_: any, __: any, element: HTMLElement, ___: any, ____: any) => void
        attachMenu: (e: React.FocusEvent<HTMLDivElement>, elementId: string) => void,
        child: ReactElement
}) {
    return (
        <Rnd
            id={props.e.id}
            key={props.e.id}
            className='item_box'
            default={{
                x: props.e.x - 75,
                y: props.e.y - 50,
                width: 150,
                height: 100,
            }}
            onDrag={props.onDrag}
            onResize={props.onResize}
        >
            <div
                className='content'
                contentEditable
                suppressContentEditableWarning
                onFocus={event => props.attachMenu(event, props.e.id)}
            >
                {props.child}
            </div>
        </Rnd>
    );
}