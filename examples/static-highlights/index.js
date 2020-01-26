import React from 'react';
import ReactDOM from 'react-dom';
import { InteractiveHighlighter } from 'react-interactive-highlighter';
import './index.css';

class TextWithHighlights extends React.Component {
    render() {
        const text = "The sky above the port was the color of television, tuned to a dead channel."
        const highlights = [
            { startIndex: 63, numChars: 12 }
        ]
        return (
            <InteractiveHighlighter
                text={text}
                highlights={highlights}
                customClass='highlighted'
            />
        )
    }
}

ReactDOM.render(<TextWithHighlights />, document.getElementById('root'));
