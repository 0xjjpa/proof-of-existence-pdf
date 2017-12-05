import React from 'react'
import { default as InputFile } from './components/inputfile'
import { default as FileList } from './components/filelist'
import { Button } from './components/button'
import { privateKeyWIF } from './constants/index'
import blockchainAnchor from 'blockchain-anchor'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileReader: new FileReader(),
      files: [],
      pages: [],
      currentFile: null,
      currentFileAsArrayBuffer: null
    }
    this.state.fileReader.onload = this.loadFileReader.bind(this)
  }
  
  loadFileReader = e => {
    this.setState({ currentFileAsArrayBuffer: e.target.result })
    window.PDFJS.getDocument(new Uint8Array(e.target.result)).then(pdf => {
      // Hardcoded to match the current viewport
      let scale = 0.72;
      let viewport, canvas, context, renderContext;
      
      // This is a good example of why handling DOM directly w/React is a bad idea
      // Ideally we just use data and grab context from canvas using something like
      // <canvas ref={(c) => this.context = c.getContext('2d')} />
      // otherwise you need to manually keep track of DOM manipulations
      const pageContainer = this._pageContainer;
      let { pages } = this.state;
      pages.map( page => pageContainer.removeChild(page) )
      pages = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then(page => {

          viewport = page.getViewport(scale);

          // Prepare canvas using PDF page dimensions.
          canvas = document.createElement("canvas");
          context = canvas.getContext('2d');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context.
          renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          page.render(renderContext);
          pageContainer.appendChild(canvas)
          pages.push(canvas)
        }); 
      }
      this.setState({ pages })
    });
  }
  
  loadFile = file => {
    // Quick example of short-circuit evaluation
    file !== this.state.currentFile && (this.setState({ currentFile: file }) || this.state.fileReader.readAsArrayBuffer(file));
  }
  
  uploadFileHandler = e => {
    const { files } = this.state;
    const file = e.target.files[0]
    files.push( file );
    this.setState({ files });
    this.loadFile(file)
  }
  
  bufToHex = buf => {
    let byteArray = new Uint8Array(buf),
        hexString = '',
        nextHexByte;

    for (let i=0; i<byteArray.byteLength; i++) {
        nextHexByte = byteArray[i].toString(16);
        if (nextHexByte.length < 2) {
            nextHexByte = '0' + nextHexByte;
        }
        hexString += nextHexByte;
    }
    return hexString;
  }
  
  createHash = () => {

   const anchorOptions = {
     btcUseTestnet: true,
     blockchainServiceName: 'blockcypher', // optional, defaults to 'Any'
     blockcypherToken: 'd741e7df12754f63986f617d0ee4eb51', // required if using 'blockcypher' service
   };
   window.crypto.subtle.digest('SHA-256', this.state.currentFileAsArrayBuffer)
     .then(async (digest) => {
        const hexData = this.bufToHex(digest)
        const feeTotalSatoshi = 150000
        const anchor = new blockchainAnchor(anchorOptions);
        console.log('privateKeyWIF', privateKeyWIF)
        let txResult
        try {
          txResult = await anchor.btcOpReturnAsync(privateKeyWIF, hexData, feeTotalSatoshi)
          console.log(`New transaction id = ${txResult.txId}`)
          console.log(`Raw transaction = ${txResult.rawTx}`)
        } catch (error) {
          console.error(error.message)
        }
     }
   )
  }
  
  render() {
    let { files } = this.state;
    console.log("Files", files)
    console.log("Pages", this.state.pages)
    return (
      <div className="center">
        <div className="Sidebar">
        <InputFile uploadFileHandler={this.uploadFileHandler.bind(this)}>
          Select a PDF file
        </InputFile>
        <FileList files={files} loadFile={this.loadFile.bind(this)} />
        {
            this.state.currentFile && 
            <div style={{ margin: '1em' }}>
            <Button onClick={this.createHash.bind(this)} type="primary">
              Create hash
            </Button>
            </div>
        }
        </div>
        <div className="Content">
          <h2 style={{ marginTop: 0, color: "#efefef" }}>Your PDF file will be viewed here.</h2>
          <div ref={c => this._pageContainer = c}></div>
        </div>
    	</div>)
  }

};

export default App;