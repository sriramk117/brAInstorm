import { useEffect, useRef, useState } from "react"
import './Whiteboard.css'
import { Rnd } from "react-rnd"

interface Element {
    type: 'text' | 'image'
    content: string
    x: number
    y: number
    id: string
}

const menuXOffset = 30
const menuYOffset = 30

export default function Whiteboard() {
    const [elements, setElements] = useState<Element[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null)
    const whiteboardRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const activeBox = useRef<HTMLDivElement | null>(null)

    
    const createNewItem = (e: React.MouseEvent<HTMLDivElement>) => {
        const whiteboard = whiteboardRef.current
        if (!whiteboard) return

        const rect = whiteboard.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setElements([...elements, {
            type: 'text',
            content: 'Text box',
            x, y,
            id: Date.now().toString()
        }])
    }

    const removeItem = () => {
        if (!selectedId) return
        setElements(elements.filter(e => e.id !== selectedId))
        detachMenu()
    }

    const attachMenu = (e: React.FocusEvent<HTMLDivElement>, elementId: string) => {
        activeBox.current = e.target
        const rect = e.target.getBoundingClientRect()
        setSelectedId(elementId)
        setMenuPos({
            x: rect.right,
            y: rect.top
        })
    }

    const detachMenu = () => {
        setSelectedId(null)
        setMenuPos(null)
        activeBox.current = null
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menu = menuRef.current
            const box = activeBox.current

            // Check if the click is outside both the selected text box and the menu
            if (box && !box.contains(event.target as Node) &&
                menu && !menu.contains(event.target as Node)
            ) {
                console.log('click outside')
                detachMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div
                id='whiteboard'
                ref={whiteboardRef}
                onDoubleClick={createNewItem}
            >
                {elements.map(e => (
                    <Rnd
                        id={e.id}
                        key={e.id}
                        className='item_box'
                        default={{
                            x: e.x,
                            y: e.y,
                            width: 150,
                            height: 100,
                        }}
                        onDrag={(_, d) => {
                            if (selectedId === e.id && menuPos) {
                                setMenuPos({
                                    x: d.x - menuXOffset,
                                    y: d.y - menuYOffset
                                })
                            }
                        }}
                    >
                        <div
                            className='content'
                            contentEditable
                            suppressContentEditableWarning
                            onFocus={event => attachMenu(event, e.id)}
                        >
                            {e.content}
                        </div>
                    </Rnd>
                ))}
            </div>

            {menuPos && selectedId && (
                <div
                    id='text-menu'
                    ref={menuRef}
                    style={{
                        left: menuPos.x,
                        top: menuPos.y
                    }}
                >
                    <button onClick={removeItem}>X</button>
                </div>
            )}
        </>
    )
}