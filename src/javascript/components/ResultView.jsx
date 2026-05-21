import React from 'react';
import Remarkable from 'remarkable';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import Button from 'react-bootstrap/lib/Button'
import FaDownload from 'react-icons/lib/fa/download'

import ParseResult from '../models/ParseResult.jsx';

export default class ResultView extends React.Component {

    static propTypes = {
        pages: React.PropTypes.array.isRequired,
        transformations: React.PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const {pages, transformations} = this.props;
        var parseResult = new ParseResult({
            pages: pages
        });
        var lastTransformation;
        transformations.forEach(transformation => {
            if (lastTransformation) {
                parseResult = lastTransformation.completeTransform(parseResult);
            }
            parseResult = transformation.transform(parseResult);
            lastTransformation = transformation;
        });

        var text = '';
        parseResult.pages.forEach(page => {
            page.items.forEach(item => {
                text += item + '\n';
            });
        });
        this.state = {
            preview: true,
            text: text
        };
    }

    switchToPreview() {
        this.setState({
            preview: true
        });
    }

    switchToEdit() {
        this.setState({
            preview: false
        });
    }

    handleChange(event) {
        this.setState({
            text: event.target.value
        });
    }

    download() {
        const element = document.createElement('a');
        const file = new Blob([this.state.text], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'converted.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    render() {
        const remarkable = new Remarkable({
            breaks: true,
            html: true
        });
        const {preview, text} = this.state;

        var textComponent;
        if (preview) {
            const html = remarkable.render(text);
            textComponent = <div dangerouslySetInnerHTML={ { __html: html } } />
        } else {
            textComponent = <textarea
                                      rows="45"
                                      cols="150"
                                      value={ text }
                                      onChange={ this.handleChange.bind(this) } />
        }
        return (
            <div>
              <ButtonToolbar>
                <ButtonGroup bsSize="medium">
                  <Button onClick={ this.switchToEdit.bind(this) } className={ !preview ? 'active' : '' }>
                    Edit
                  </Button>
                  <Button onClick={ this.switchToPreview.bind(this) } className={ preview ? 'active' : '' }>
                    Preview
                  </Button>
                </ButtonGroup>

                <ButtonGroup bsSize="medium" className="pull-right">
                  <Button onClick={ this.download.bind(this) } bsStyle="primary">
                    <FaDownload /> Download .md
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
              <hr/>
              { textComponent }
            </div>
        );
    }

}