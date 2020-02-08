import * as React from 'react';
import ReactDOM from 'react-dom';
import { InteractiveHighlighter } from 'react-interactive-highlighter';
import './index.css';

class TextWithHighlights extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "I saw the best minds of my generation destroyed by madness, starving hysterical naked, dragging themselves...",
            highlights: []
        }
        this.selectionHandler = this.selectionHandler.bind(this);
    }

    selectionHandler(selected, startIndex, numChars) {
		console.log(`selected: ${selected}`);
		console.log(`start: ${startIndex}`);
		console.log(`len: ${numChars}`);
        this.setState({
            text: this.state.text,
            highights: this.state.highlights.push({
                startIndex: startIndex,
                numChars: numChars
            })
        })
    }

    render() {
        return (
            <InteractiveHighlighter
                text={this.state.text}
                highlights={this.state.highlights}
                customClass='highlighted'
                selectionHandler={this.selectionHandler}
            />
        )
    }
}

ReactDOM.render(<TextWithHighlights />, document.getElementById('root'));