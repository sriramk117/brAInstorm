import { FormEvent, useEffect, useRef, useState } from 'react'
import './Whiteboard.css'
import Item from './Item'
import { AudioRecorder } from 'react-audio-voice-recorder'
import { Rnd } from 'react-rnd'
import Markdown from 'react-markdown'

export interface Element {
    type: 'text' | 'audio'
    content: string | Blob
    x: number
    y: number
    id: string
}

const menuXOffset = -10
const menuYOffset = -8
export default function Whiteboard() {
    // const [file, setFile] = useState<Blob | null>(null);
    const [mode, setMode] = useState<'main'|'ai'>('main')
    const [results, setResults] = useState<string>('')
    const [elements, setElements] = useState<Element[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null)
    const [inputText, setInputText] = useState<string>('')
    const whiteboardRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const activeBox = useRef<HTMLDivElement | null>(null)

    const submitData = async () => {
        const obj: {'text_snippets': {text: string}[], 'audio_snippets': string[]} = {
            'text_snippets': elements.filter(e => e.type === 'text').map(e => ({'text': document.getElementById(e.id)!.textContent!})),
            'audio_snippets': elements.filter(e => e.type === 'audio').map(e => URL.createObjectURL(e.content as Blob))
        }

        // const reader = new FileReader()
        // const FFmpeg = await import('@ffmpeg/ffmpeg')
        // const ffmpeg = FFmpeg.createFFmpeg({ log: false })
        // await ffmpeg.load()

        // await Promise.all(
        //     elements.filter(e => e.type === 'audio').map(async e => {
        //         ffmpeg.FS(
        //             'writeFile',
        //             `${e.id}.webm`,
        //             new Uint8Array(await (e.content as Blob).arrayBuffer())
        //         )
    
        //         await ffmpeg.run('-i', `${e.id}.webm`, `${e.id}.wav`)
    
        //         const outputData = ffmpeg.FS('readFile', `${e.id}.wav`)
        //         const outputBlob = new Blob([outputData.buffer], {
        //             type: `audio/wav`,
        //         })
    
        //         reader.readAsDataURL(outputBlob)
        //         await new Promise<void>(resolve => {
        //             reader.onloadend = async () => {
        //                 const b64data = (reader.result! as string).split(',')[1]
        //                 obj.audio_snippets.push(b64data)
        //                 resolve()
        //             }
        //         })
        //     })
        // )

        const url = 'http://127.0.0.1:8000/brainstorm'
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(response => response.json())
            .then(data => {
                console.log(JSON.parse(data).response)
                setResults(JSON.parse(data).response)
            })
        setMode('ai')
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
            x: (Math.random()*(rect.width*0.8))+(rect.width*.1),
            y: (Math.random()*(rect.height*.6))+(rect.height*.1),
            id: Date.now().toString()
        }])
        setInputText('')
        document.getElementById('text-input')!.blur()
    }

    const addAudio = async (blob: Blob) => {
        console.log("ADDING AUDIO")
        const whiteboard = whiteboardRef.current
        if (!whiteboard) return
        let id = Date.now().toString()
        const rect = whiteboard.getBoundingClientRect()
        setElements([...elements, {
            type: 'audio',
            content: blob,
            x: (Math.random()*(rect.width*0.8))+(rect.width*.1),
            y: (Math.random()*(rect.height*.6))+(rect.height*.1),
            id: Date.now().toString()
        }])
        console.log("TRYING TO WRITE FILE")
        const FFmpeg = await import('@ffmpeg/ffmpeg')
        const ffmpeg = FFmpeg.createFFmpeg({ log: false })
        await ffmpeg.load()
        
        
        ffmpeg.FS(
            'writeFile',
            `${id}.webm`,
            new Uint8Array(await blob.arrayBuffer())
        );
    
        // Run FFmpeg command to convert the file to WAV format
        await ffmpeg.run('-i', `${id}.webm`, `${id}.wav`);
    
        // Read the output WAV file from FFmpeg's filesystem
        const outputData = ffmpeg.FS('readFile', `${id}.wav`);
        console.log("READ FILE")



        // Create a Blob from the output data
        const outputBlob = new Blob([outputData.buffer], {
            type: 'audio/wav',
        });
        const formData = new FormData();
        formData.append('file_upload', outputBlob, `${id}.wav`);

        try {
            const endpoint = "http://127.0.0.1:8000/uploadFile"
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });
            if (response.ok){
                response.json().then(value => console.log(value))
                setElements([...elements, {
                    type: 'audio',
                    content: blob,
                    x: (Math.random()*(rect.width*0.8))+(rect.width*.1),
                    y: (Math.random()*(rect.height*.6))+(rect.height*.1),
                    id: Date.now().toString()
                }])
                // console.log(response.json)
            }
            else{
                console.log("FAILED")
            }
            
        } catch(error) {
            console.error();
        }

        //convert blob to wav
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

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    console.log(results)

    return (
        <>
            {mode === 'main' ? <>
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
                            key={e.id}
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
                        <Rnd
                            id={e.id}
                            key={e.id}
                            className='item_box audio'
                            default={{
                                x: e.x - 75,
                                y: e.y - 50,
                                width: 150,
                                height: 100,
                            }}
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
                        >
                            <div onFocus={event => attachMenu(event, e.id)}>
                                <audio
                                    src={URL.createObjectURL(e.content as Blob)}
                                    controls
                                />
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
                        onClick={removeItem}
                    >x
                    </div>
                )}
                </> : <>
                    <div id='back' onClick={() => setMode('main')}>Go Back</div>
                    <div id='results'>
                        <Markdown>{results}</Markdown>
                    </div>
                </>
            }
        </>
    )
}