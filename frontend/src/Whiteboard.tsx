import { FormEvent, useEffect, useRef, useState } from "react"
import './Whiteboard.css'
import Item from "./Item"
import { AudioRecorder } from "react-audio-voice-recorder"

export interface Element {
    type: 'text' | 'audio'
    content: string
    x: number
    y: number
    id: string
}

const menuXOffset = -10
const menuYOffset = -8

export default function Whiteboard() {
    const [elements, setElements] = useState<Element[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null)
    const [inputText, setInputText] = useState<string>('')
    const whiteboardRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const activeBox = useRef<HTMLDivElement | null>(null)

    const submitData = () => {
        const obj = {"text_snippets": elements.map(e => ({'text': document.getElementById(e.id)!.textContent}))}
        alert(JSON.stringify(obj))
    }
    
    const createNewItem = (e: React.MouseEvent<HTMLDivElement>) => {
        const whiteboard = whiteboardRef.current
        if (!whiteboard) return

        const rect = whiteboard.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setElements([...elements, {
            type: 'text',
            content: '',
            x, y,
            id: Date.now().toString()
        }])
    }

    const addText = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const whiteboard = whiteboardRef.current
        if (!whiteboard) return

        const rect = whiteboard.getBoundingClientRect()
        setElements([...elements, {
            type: 'text',
            content: inputText,
            x: (Math.random()*(rect.width*0.9)),
            y: (Math.random()*(rect.height*.6))+(rect.height*.1),
            id: Date.now().toString()
        }])
        setInputText('')
        document.getElementById('text-input')!.blur()
    }

    const addAudio = (blob: Blob) => {
        const whiteboard = whiteboardRef.current
        if (!whiteboard) return

        const rect = whiteboard.getBoundingClientRect()
        setElements([...elements, {
            type: 'audio',
            content: URL.createObjectURL(blob),
            x: (Math.random()*(rect.width*0.9)),
            y: (Math.random()*(rect.height*.6))+(rect.height*.1),
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
        document.getElementById(elementId)!.style.zIndex = '1'
        setMenuPos({
            x: rect.right + menuXOffset,
            y: rect.top + menuYOffset
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
            if (
                box && !box.contains(event.target as Node) &&
                menu && !menu.contains(event.target as Node)
            ) {
                detachMenu()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <>
            <form onSubmit={addText}>
                <div id='input-bar'>
                    <input
                        type='text'
                        id='text-input'
                        name='text-input'
                        placeholder={'What\'s on your mind?'}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        autoFocus
                    />
                    <div id='audio-input'>
                        <AudioRecorder
                            onRecordingComplete={addAudio}
                        />
                    </div>
                </div>
            </form>
            <div
                id='whiteboard'
                ref={whiteboardRef}
                onDoubleClick={createNewItem}
            >
                {elements.length > 0 ?
                    <div id='submit' onClick={submitData}>Generate!</div> :
                    <div id='help-message'>{'Type in the above box or\ndouble-click to create a new thought.'}</div>
                }
                {elements.filter(e => e.type === 'text').map(e => (
                    <Item
                        e={e}
                        onDrag={(_, d) => {
                            if (selectedId === e.id && menuPos) {
                                setMenuPos({
                                    x: menuPos.x + d.deltaX,
                                    y: menuPos.y + d.deltaY
                                })
                            }
                        }}
                        onResize={(_, __, element, ___, ____) => {
                            if (selectedId === e.id && menuPos) {
                                const rect = element.getBoundingClientRect()
                                setMenuPos({
                                    x: rect.right + menuXOffset,
                                    y: rect.top + menuYOffset
                                })
                            }
                        }}
                        attachMenu={attachMenu}
                        child={<>{e.content}</>}
                    />
                ))}
                {elements.filter(e => e.type === 'audio').map(e => (
                    <Item
                        e={e}
                        onDrag={(_, d) => {
                            if (selectedId === e.id && menuPos) {
                                setMenuPos({
                                    x: menuPos.x + d.deltaX,
                                    y: menuPos.y + d.deltaY
                                })
                            }
                        }}
                        onResize={(_, __, element, ___, ____) => {
                            if (selectedId === e.id && menuPos) {
                                const rect = element.getBoundingClientRect()
                                setMenuPos({
                                    x: rect.right + menuXOffset,
                                    y: rect.top + menuYOffset
                                })
                            }
                        }}
                        attachMenu={attachMenu}
                        child={
                            <audio
                                src={e.content}
                                controls
                            />
                        }
                    />
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
                    onClick={removeItem}
                >x
                </div>
            )}
        </>
    )
}