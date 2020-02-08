import React, { Component, MouseEvent } from 'react';

type SelectionMarker = {selectionStart: number, selectionLength: number};
type Segment = { start: number, end: number, highlights: number[]};

interface InteractiveHighlighterProps {
    // The text containing highlights.
    text: string;
    // CSS class used for highlighted sections ("default" if not defined).
    customClass?: string;
    // List of highlights.
    highlights: { startIndex: number, numChars: number }[];
    // If defined, this function will be called whenever a new selection is made.
    selectionHandler?(selection: string, selectionStart: number, selectionLen: number): void;
    // Used only to mock around the DOM for testing purposes.
    getSelectionFn?(): SelectionMarker
}

// true if arrays consist of the same primitives (in the same order)
function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * InteractiveHighlighter component.
 *
 * Allows highlighting of the text selected by user with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index
 * - selection end index
 *
 * Supports pre-existing highlights passed through the "highlights" property.
 *
 * It is difficult to unit test the DOM-based selection API, so this class supports a property
 * providing a mock that can be used to return the start & length of a selection. This is
 * intended only for use in tests.
 */
export class InteractiveHighlighter extends Component<InteractiveHighlighterProps, {}> {
    private _getSelectionMarker: Function;
    private _segments: Segment[];

    constructor(props: InteractiveHighlighterProps) {
        super(props);
        if (this.props.getSelectionFn) {
            this._getSelectionMarker = this.props.getSelectionFn;
        } else {
            this._getSelectionMarker = this._getSelectionFromDOM;
        }
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
        this._segments = [];
    }

    private _getSelectionFromDOM(): SelectionMarker | null {
        const selectionObj = window.getSelection();
        if (! selectionObj) {
            console.error("getSelection() returned null");
            return null;
        }

        // anchorNode is the node in which the selection begins; focusNode that
        //  in which it ends. (See https://developer.mozilla.org/en-US/docs/Web/API/Selection.)

        const selection = selectionObj.toString();
        const anchorNode = selectionObj.anchorNode;
        const focusNode = selectionObj.focusNode;
        const anchorOffset = selectionObj.anchorOffset;
        const focusOffset = selectionObj.focusOffset;

        // did we select "forward" or backward?
        let relativePosition: number;
        let isForwardSelection = false;
        if (anchorNode && focusNode) { // wrapped to stop compiler warnings about possible null-ness
            relativePosition = anchorNode.compareDocumentPosition(focusNode);
        } else {
            console.warn("Returning from onMouseUpHandler because anchorNode or focusNode are null");
            return null
        }

        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        if (relativePosition === anchorNode!.DOCUMENT_POSITION_FOLLOWING) {
            isForwardSelection = true;
        } else if (relativePosition === 0) {
            isForwardSelection = (focusOffset - anchorOffset) > 0;
        }

        let selectionStart = isForwardSelection ? anchorOffset : focusOffset;

        // figure out the actual absolute index of the selection (in the original string) - to do
        //  this we need to account for the spans that might have been rendered in order to handle
        //  highlights that already exist.
        let parent: Element;
        if (isForwardSelection) {
            if (anchorNode.parentNode) {
                parent = anchorNode.parentNode as Element;
            } else {
                console.error("Ended up with null anchorNode.parentNode - should be impossible!");
                return null
            }
        } else {
            if (focusNode.parentNode) {
                parent = focusNode.parentNode as Element;
            } else {
                console.error("Ended up with null focusNode.parentNode - should be impossible!");
                return null
            }
        }

        // adjust selectionStart to reflect the index into the whole text (not just the current segment)
        if (parent.getAttribute('data-segment')) {
            const segmentNum = Number(parent.getAttribute('data-segment'));
            selectionStart += this._segments[segmentNum].start;
        }

        // clear selection
        selectionObj.removeAllRanges();

        return {selectionStart: selectionStart, selectionLength: selection.length }
    }

    // Note: a "segment" is a string in which each char is highlighted the same way. When there are no
    //  overlapping highlights, segments are simply highlights and the non-highlighted text
    //  between them. When there are overlapping highlights, segments distinguish text
    //  in highlight A from text in highlights A and B from text in highlight C (and so forth).
    private _computeSegments(): Segment[]{
        const highlights = this.props.highlights;

        const segments: Segment[] = [];

        let segmentStart = 0;
        let currentHighlights: Array<boolean> = [];
        for (let idx = 0; idx < this.props.text.length; idx++) {
            // build an array of booleans corresponding to each highlight - true means
            //  the current character is in the given highlight
            const highlightsIncludingThisChar = highlights.map(
                h => (idx >= (h.startIndex)) && (idx < h.startIndex + h.numChars) ? true : false
            )
            if (! arraysEqual(currentHighlights, highlightsIncludingThisChar)) {
                // the current character is the start of the next segment
                if (idx > 0) {
                    segments.push({
                        start: segmentStart,
                        end: idx-1,
                        // the highlights array has a number for each highlight this segment is part of
                        // (this uses -1 to satisfy the compiler - null might make more sense)
                        highlights: currentHighlights.map( (e,i) => e ? i : -1).filter(e => e!== -1)
                    })
                    segmentStart = idx
                }
                currentHighlights = highlightsIncludingThisChar.slice()
            }
        }
        if (segments.length === 0) {
            // special case - no highlights
            segments.push({start: 0, end: this.props.text.length, highlights: []})
        } else {
            // record the final segment
            segments.push({
                start: segmentStart,
                end: this.props.text.length,
                highlights: currentHighlights.map( (e,i) => e ? i : -1).filter(e => e!== -1)
            })
        }
        return(segments)
    }

    onMouseUpHandler(e: MouseEvent): void {
        e.preventDefault();
        const marker: SelectionMarker = this._getSelectionMarker();

        if (marker && marker.selectionLength) {
            const selection = this.props.text.substr(marker.selectionStart, marker.selectionLength);
            if (this.props.selectionHandler) {
                this.props.selectionHandler(
                    selection,
                    marker.selectionStart,
                    marker.selectionLength
                );
            }
        }
    }

    render(): React.ReactNode {
        this._segments = this._computeSegments();
        const textContent = this.props.text;
        const markedUp: JSX.Element[] = [];
        for (let segmentNum = 0; segmentNum < this._segments.length; segmentNum++) {
            const spanStart = this._segments[segmentNum].start;
            const spanLen = this._segments[segmentNum].end - this._segments[segmentNum].start + 1;
            if (this._segments[segmentNum].highlights.length > 0) {
                // highlighted
                markedUp.push(<span
                    key={"d"+segmentNum}
                    data-segment={segmentNum}
                    className={this.props.customClass || "default"}>
                {textContent.substr(spanStart, spanLen)}
                </span>);
            } else {
                // non-highlighted
                markedUp.push(<span
                    key={"d"+segmentNum}
                    data-segment={segmentNum}>
                {textContent.substr(spanStart, spanLen)}
                </span>);
            }
        }
        return(
            <span onMouseUp={this.onMouseUpHandler}>
                {markedUp}
            </span>
        )

    }
}

