import { useState } from "react";
import { BarLoader } from "react-spinners";
import "./Submit.css";
import { Element } from "./Whiteboard";

export default function Submit({elements, setResults, setMode}: {
    elements: Element[],
    setResults: React.Dispatch<React.SetStateAction<string>>,
    setMode: React.Dispatch<React.SetStateAction<"ai" | "main">>
}) {
    const [loading, setLoading] = useState(false);

    const submitData = async () => {
        setLoading(true);
        const obj: {'text_snippets': {text: string}[]} = {
            'text_snippets': elements.filter(e => e.type === 'text').map(e => ({'text': document.getElementById(e.id)!.textContent!}))
        }

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
                setResults(JSON.parse(data).response)
            })
        setLoading(false);
        setMode('ai')
    }

    return (
        <div id='submit' onClick={loading ? () => Promise<void> : submitData}>
            {loading ?
                <BarLoader
                    color="white"
                    height={5}
                />
            :
                <div>Generate!</div>
            }
        </div>
    )
}
