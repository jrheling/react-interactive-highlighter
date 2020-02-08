// src/Highlighter.test.tsx

import * as React from 'react';
import * as enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { InteractiveHighlighter } from '../src/InteractiveHighlighter';
import { shallow, mount } from 'enzyme';

enzyme.configure({ adapter: new Adapter() });

describe('<InteractiveHighlighter />', () => {

    it('should work', () => {
        const wrapper = shallow(<InteractiveHighlighter text="blah" highlights={[]}/>);
    });

    it('allows us to set props', () => {
        const wrapper = mount(<InteractiveHighlighter text="foo bar baz" highlights={[]}/>);

        // console.log(wrapper.debug());
        expect(wrapper.find('span').children().last().text()).toContain('foo bar baz');
    });

    it('renders text prop when given no highlights', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            text="foo bar baz"
            highlights={[]}
            />
        );
        // console.debug(wrapper.debug());

        expect(wrapper.find('span')).toHaveLength(2);

        // the original text should still be present
        expect(wrapper.children().text()).toEqual('foo bar baz');
    });

    it('correctly highlights based on props', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x
            text="foo bar baz"
            highlights={[{startIndex: 4, numChars: 3}]}
            customClass="MyClass"
            />
        );
        // console.debug(wrapper.debug());
        expect(wrapper.find('[data-segment]')).toHaveLength(3);
        expect(wrapper.find({ 'data-segment': 0}).text()).toEqual("foo ");
        expect(wrapper.find({ 'data-segment': 0}).prop('className')).not.toEqual('MyClass');
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("bar");
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('MyClass');
        expect(wrapper.find({ 'data-segment': 2}).text()).toEqual(" baz");
        expect(wrapper.find({ 'data-segment': 2}).prop('className')).not.toEqual('MyClass');
    });

    it('uses the specified className when highlighting', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            text="foo bar baz"
            highlights={[{startIndex: 4, numChars: 3}]}
            customClass="myClass"
            />
        );
        // console.debug(wrapper.debug());
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('myClass');
    });

    it('does not use the specified className for non-highlighted text', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            text="foo bar baz"
            highlights={[{startIndex: 4, numChars: 3}]}
            customClass="myClass"
            />
        );
        // console.debug(wrapper.debug());
        expect(wrapper.find({ 'data-segment': 0}).prop('className')).not.toEqual('myClass');
    });

    it('correctly highlights multiple substrings', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[
                {startIndex: 4, numChars: 11}, // "is the time"
                {startIndex: 35, numChars: 1}, // "t"
                {startIndex: 38, numChars: 15} // "come to the aid"
            ]}
            customClass="MyClass"
            />
        );
        // console.debug(wrapper.debug());
        expect(wrapper.find('[data-segment]')).toHaveLength(7);
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("is the time");
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 2}).prop('className')).not.toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 3}).text()).toEqual("t");
        expect(wrapper.find({ 'data-segment': 3}).prop('className')).toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 4}).prop('className')).not.toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 5}).text()).toEqual("come to the aid");
        expect(wrapper.find({ 'data-segment': 5}).prop('className')).toEqual('MyClass');
    });

    it('allows overlapping substrings', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[
                {startIndex: 4, numChars: 11},  // "is the time"
                {startIndex: 11, numChars: 20}, // "time for all good fo" (overlaps)
            ]}
            customClass="MyClass"
            />
        );
        expect(wrapper.find('[data-segment]')).toHaveLength(5);
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("is the ");
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 2}).text()).toEqual("time");
        expect(wrapper.find({ 'data-segment': 2}).prop('className')).toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 3}).text()).toEqual(" for all good fo");
        expect(wrapper.find({ 'data-segment': 2}).prop('className')).toEqual('MyClass');
    });

    it('correctly handles insanely overlapping substrings', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5
            text="now is the time for all good folks to come to the aid of their country"
            customClass="myClass"
            highlights={[
                // non-hl
                {startIndex: 2, numChars: 40},  // "w is ... to come"
                {startIndex: 4, numChars: 11},  // "is the time"
                {startIndex: 5, numChars: 4},   // "s th"
                {startIndex: 6, numChars: 2},   // " t"
                {startIndex: 11, numChars: 20}, // "time for all good fo"
                {startIndex: 30, numChars: 4},  // "olks"
                {startIndex: 33, numChars: 3},  // "s t"
                {startIndex: 35, numChars: 2},  // "to"
                {startIndex: 36, numChars: 1},  // "o"
                {startIndex: 38, numChars: 1},  // "c"
                // non-hl
                {startIndex: 44, numChars: 3},  // "o t"
                // non-hl
            ]}
            />
        );
        expect(wrapper.find('[data-segment]')).toHaveLength(21);
        expect(wrapper.find({ 'data-segment': 0}).text()).toEqual("no");
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("w ");
        expect(wrapper.find({ 'data-segment': 2}).text()).toEqual("i");
        expect(wrapper.find({ 'data-segment': 3}).text()).toEqual("s");
        expect(wrapper.find({ 'data-segment': 4}).text()).toEqual(" t");
        expect(wrapper.find({ 'data-segment': 5}).text()).toEqual("h");
        expect(wrapper.find({ 'data-segment': 6}).text()).toEqual("e ");
        expect(wrapper.find({ 'data-segment': 7}).text()).toEqual("time");
        expect(wrapper.find({ 'data-segment': 8}).text()).toEqual(" for all good f");
        expect(wrapper.find({ 'data-segment': 9}).text()).toEqual("o");
        expect(wrapper.find({ 'data-segment': 10}).text()).toEqual("lk");
        expect(wrapper.find({ 'data-segment': 11}).text()).toEqual("s");
        expect(wrapper.find({ 'data-segment': 12}).text()).toEqual(" ");
        expect(wrapper.find({ 'data-segment': 13}).text()).toEqual("t");
        expect(wrapper.find({ 'data-segment': 14}).text()).toEqual("o");
        expect(wrapper.find({ 'data-segment': 15}).text()).toEqual(" ");
        expect(wrapper.find({ 'data-segment': 16}).text()).toEqual("c");
        expect(wrapper.find({ 'data-segment': 17}).text()).toEqual("ome");
        expect(wrapper.find({ 'data-segment': 18}).text()).toEqual(" t");
        expect(wrapper.find({ 'data-segment': 19}).text()).toEqual("o t");
        expect(wrapper.find({ 'data-segment': 20}).text()).toEqual("he aid of their country");

        // all segments except 0, 19, and 21 should be higlighted
        for (let i=0; i<21; i++) {
            if (i == 0 || i == 18 || i == 20) {
                expect(wrapper.find({ 'data-segment': i}).prop('className')).not.toEqual('myClass');
            } else {
                expect(wrapper.find({ 'data-segment': i}).prop('className')).toEqual('myClass');
            }
        }
    });

    it('maintains the original text when there are overlapping substrings', () => {
        // After allowing overlapping substrings, the original text was getting unexpectedly modified.
        // This verifies that that is not happening.
        //                  0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
        const sourceText = "now is the time for all good folks to come to the aid of their country"
        const wrapper = mount(
            <InteractiveHighlighter
            text={sourceText}
            highlights={[
                {startIndex: 4, numChars: 11}, // "is the time"
                {startIndex: 11, numChars: 20}, // overlaps
            ]}
            />
        );
        expect(wrapper.children().text()).toEqual(sourceText);
    })

    it('correctly highlights substrings at the start of the text', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[
                {startIndex: 0, numChars: 4}, // "now "
            ]}
            customClass="MyClass"
            />
        );
        expect(wrapper.find({ 'data-segment': 0}).text()).toEqual("now ");
        expect(wrapper.find({ 'data-segment': 0}).prop('className')).toEqual('MyClass');
    });

    it('correctly highlights substrings at the end of the text', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[
                {startIndex: 63, numChars: 7}, // "country"
            ]}
            customClass="MyClass"
            />
        );
        //console.log(wrapper.debug());
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("country");
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('MyClass');
    });

    it('correctly highlights substrings _almost_ at the end of the text', () => {
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country."
            highlights={[
                {startIndex: 63, numChars: 7}, // "country"
            ]}
            customClass="MyClass"
            />
        );
        //console.log(wrapper.debug());
        expect(wrapper.find({ 'data-segment': 1}).text()).toEqual("country");
        expect(wrapper.find({ 'data-segment': 1}).prop('className')).toEqual('MyClass');

        expect(wrapper.find({ 'data-segment': 2}).text()).toEqual(".");
        expect(wrapper.find({ 'data-segment': 2}).prop('className')).not.toEqual('MyClass');

    });

    it('handles new selections made in the text', () => {
        const handlerFunc = jest.fn();
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[]}
            getSelectionFn={() => {
                return {selectionStart: 20, selectionLength: 14};
            }}
            selectionHandler={handlerFunc}
            />
        );

        wrapper.simulate("mouseup");
        expect(handlerFunc).toHaveBeenCalledWith("all good folks", 20, 14);
    });

    it('handles selections made in between highlights defined in props', () => {
        const handlerFunc = jest.fn();
        const wrapper = mount(
            <InteractiveHighlighter
            //    0123456789x    5    2    5    3    5    4    5    5    5    6    5    (end=69)
            text="now is the time for all good folks to come to the aid of their country"
            highlights={[
                {startIndex: 4, numChars: 11},
                {startIndex: 55, numChars: 2}
            ]}
            getSelectionFn={() => {
                return {selectionStart: 20, selectionLength: 14};
            }}
            selectionHandler={handlerFunc}
            />
        );

        wrapper.simulate("mouseup");
        expect(handlerFunc).toHaveBeenCalledWith("all good folks", 20, 14);
    });

});